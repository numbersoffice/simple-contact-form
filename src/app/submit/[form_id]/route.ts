import { consumeBalance } from '@/functions/billing'
import {
  checkQueryParams,
  customResponse,
  extractFormData,
  removeUtilityFields,
  successResponse,
} from '@/functions/request'
import isSpam from '@/functions/spam'
import payload from '@/lib/payload'
import { Recipient } from '@/payload-types'
import { NextRequest, NextResponse } from 'next/server'

const honeypots = ['are_you_human']

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ form_id: string }> },
) {
  const awaitedParams = await params

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    // 'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
  }

  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  const origin = request.headers.get('origin')

  // Check if form has been submitted from an HTML form or programatically
  const isHtmlForm = request.headers.get('content-type') === 'application/x-www-form-urlencoded'
  console.log(`${isHtmlForm ? 'Html' : 'Programmatic'} form submission received.`)

  // Verify required query parameters
  const queryRes = checkQueryParams(awaitedParams, ['form_id'])
  if (!queryRes.success) return customResponse(400, { message: queryRes.message, success: false })

  // Get form fields
  const formData = await request.formData()
  const fields = extractFormData(formData)

  // REDIRECT
  // Check for custom redirect URL
  const redirect =
    fields.find((field) => field.name === 'redirect')?.value ||
    `${protocol}://${host}/submit-success?return_url=${origin}`

  // HONEYPOT
  // Check if any honeypot fields have been filled in
  const hasHoneypot = fields.some((field) => honeypots.includes(field.name) && field.value)

  // Send success response if honeypot is detected to prevent bot from knowing
  if (hasHoneypot)
    return customResponse(
      200,
      {
        message: 'Form submitted.',
        success: true,
      },
      'Honeypot detected. Not sending email.',
    )

  // Remove utility fields from form data
  const finalFields = removeUtilityFields(fields, ['redirect', ...honeypots])

  // SPAM FILTER
  const spam = await isSpam(finalFields)

  if (spam) {
    // Log spam
    console.log('Spam detected. Not sending email.')

    // Send regular success response in order to not give away spam detection
    return successResponse(isHtmlForm, redirect, 'Form submitted.')
  }

  ////////////////////////////
  // ALL CONTENT CHECKS PASSED
  ////////////////////////////

  // Due diligence
  const formRes = await payload.findByID({
    collection: 'forms',
    id: awaitedParams.form_id,
  })

  // Check if form exists
  if (!formRes) {
    return customResponse(400, {
      success: false,
      message: 'Form ID does not exist in database.',
    })
  }

  // Check if recipients field exists
  const recipients = formRes.recipients
  if (!recipients)
    return customResponse(500, {
      message: 'Error: Recipients field is not set up correctly.',
      success: false,
    })

  // Check if form has a team
  const team = formRes.team
  if (!team || typeof team !== 'object')
    return customResponse(500, {
      message: 'Error: Team field is not set up correctly.',
      success: false,
    })

  // Charge team for form submission
  const chargeRes = await consumeBalance({ team, charge: 1 })

  if (chargeRes.error) {
    return customResponse(500, {
      message: chargeRes.error,
      success: false,
    })
  }

  // Check if Stripe customer has a payment method
  // const hasPaymentMethod = await checkPaymentMethod(formEmail)

  // Send note to user if no payment method exists
  // if (!hasPaymentMethod) {
  //   sgMail.send({
  //     templateId: 'd-1a9c3f747ff44dd8bc1d2d63317160b9',
  //     to: formEmail,
  //     from: {
  //       name: 'Simple Contact Form',
  //       email: misc.senderEmail,
  //     },
  //     subject: 'Activate your form',
  //     dynamicTemplateData: {
  //       payment_url: `${protocol}://${host}/payment?email=${formEmail}&form_id=${params.form_id}`,
  //     },
  //   })

  //   return customResponse(400, {
  //     message: 'This form has not been activated.',
  //     success: false,
  //   })
  // }

  // All checks passed - Submit form data to recipients
  recipients.forEach((recipient: Recipient | string) => {
    // Skip malformedrecipients
    if (typeof recipient === 'string') return

    // Consrtuct message string
    const message = finalFields
      .map((field) => `${field.name}: ${field.value}`)
      .join('\n')
      .replace(/,/g, '\n')

    // Send email to each recipient
    payload.sendEmail({
      to: recipient.email,
      subject: 'New Form Submission',
      text: message,
    })
  })

  // const mailRes = await sgMail.send({
  //   templateId: 'd-9961ad8fc1204d82b9abb4539f0a3781',
  //   to: formEmail,
  //   from: {
  //     name: 'Simple Contact Form',
  //     email: misc.senderEmail,
  //   },
  //   subject: 'New form submission',
  //   dynamicTemplateData: { fields: finalFields },
  // })

  // Example of adding CORS headers to a response
  const response = successResponse(isHtmlForm, redirect, `Form submitted. TeamId: ${team.id}`)
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}
