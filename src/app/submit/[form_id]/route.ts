import { consumeBalance } from '@/functions/billing'
import {
  checkQueryParams,
  customResponse,
  extractFormData,
  successResponse,
} from '@/functions/request'
import checkforSpam from '@/functions/spam'
import payload from '@/lib/payload'
import { Recipient } from '@/payload-types'
import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
const HONEYPOTS = ['are_you_human']

// Abuse guards
const MAX_FIELDS = 100
const MAX_FIELD_LEN = 3000
const MAX_BYTES = 500_000 // 0.5MB

// Utility function to apply CORS headers to a response
const withCORS = (res: Response) => {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => res.headers.set(key, value))
  return res
}

// Handle preflight requests
export function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

// Main handler
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ form_id: string }> },
) {
  try {
    const awaitedParams = await params

    // Early payload-size guard using Content-Length
    // More thorough checks are done later based on the actual parsed fields
    const contentLength = request.headers.get('content-length')
    if (contentLength && Number(contentLength) > MAX_BYTES) {
      console.warn(`Rejected request: payload size exceeds limit.`)
      return withCORS(
        customResponse(413, {
          success: false,
          message: 'Payload too large.',
        }),
      )
    }

    // Content-Type detection (form or programmatic)
    const contentType = (request.headers.get('content-type') || '').toLowerCase()
    const isHtmlForm =
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')

    console.info(`${isHtmlForm ? 'Html' : 'Programmatic'} form submission received.`)

    // Check if form_id has been provided
    const queryRes = checkQueryParams(awaitedParams, ['form_id'])
    if (!queryRes.success)
      return withCORS(customResponse(400, { message: queryRes.message, success: false }))
    const formId = awaitedParams.form_id

    // Parse body as form data
    // Works for both html forms and programmatic requests
    const formData = await request.formData()
    let fields = extractFormData(formData)

    // Basic abuse guards
    if (fields.length > MAX_FIELDS) {
      return withCORS(
        customResponse(413, {
          success: false,
          message: 'Too many fields in submission.',
        }),
      )
    }
    fields = fields.map((f) => ({
      ...f,
      value:
        String(f.value).slice(0, MAX_FIELD_LEN) +
        (f.value.length > MAX_FIELD_LEN ? ' [max length reached]' : ''),
      name: String(f.name).slice(0, 200),
    }))

    // Set Return URL
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const origin = request.headers.get('origin')
    const returnUrl = `${protocol}://${host}/submit-success?return_url=${origin}`

    // Honeypot
    // Check if any honeypot fields have been filled in
    const hasHoneypot = fields.some((f) => HONEYPOTS.includes(f.name) && f.value)
    if (hasHoneypot)
      return withCORS(
        successResponse(
          isHtmlForm,
          returnUrl,
          'Form submitted.',
          'Honeypot detected. Not sending email.',
        ),
      )

    // Remove utility fields
    fields = fields.filter((f) => !HONEYPOTS.includes(f.name))

    // Check if message is spam
    const isSpam = await checkforSpam(fields)
    if (isSpam) {
      // Log spam
      console.log('Spam detected. Not sending email.')

      // Send regular success response in order to not give away spam detection to malicious actors
      return withCORS(successResponse(isHtmlForm, returnUrl, 'Form submitted.'))
    }

    ////////////////////////////
    // ALL CONTENT CHECKS PASSED
    ////////////////////////////

    // Due diligence
    // Fetch form from database
    const formRes = await payload.find({
      collection: 'forms',
      where: {
        formId: { equals: formId },
      },
      limit: 1,
    })

    // Check if form exists
    if (!formRes) {
      return withCORS(
        customResponse(400, {
          success: false,
          message: 'Form ID does not exist in database.',
        }),
      )
    }

    // Check if recipients field exists
    const recipients = formRes.docs[0].recipients
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0)
      return withCORS(
        customResponse(500, {
          message: 'Error: Recipients field is not set up correctly.',
          success: false,
        }),
      )

    // Check if form has a team
    const team = formRes.docs[0].team
    if (!team || typeof team !== 'object' || !('id' in team))
      return withCORS(
        customResponse(500, {
          message: 'Error: Team field is not set up correctly.',
          success: false,
        }),
      )

    // Billing - Charge team for form submission
    const chargeRes = await consumeBalance({ team, charge: 1 })
    if (chargeRes.error) {
      return withCORS(
        customResponse(500, {
          message: chargeRes.error,
          success: false,
        }),
      )
    }

    // All checks passed
    // Build message
    const message = fields
      .map((field) => `${field.name}: ${field.value}`)
      .join('\n')
      .replace(/,/g, '\n')

    // Send emails
    try {
      recipients.forEach((r: Recipient | string) => {
        // Skip malformed recipients
        if (typeof r === 'string') return

        payload.sendEmail({
          to: r.email,
          subject: 'Submission - ' + formRes.docs[0].name,
          text: message,
        })
      })
    } catch (err) {
      console.error('One or more emails failed to send', err)
    }

    return withCORS(successResponse(isHtmlForm, returnUrl, `Form submitted. TeamId: ${team.id}`))
  } catch (err) {
    console.error('Unhandled form submission error:', err)
    return withCORS(
      customResponse(500, {
        message: 'An unexpexted error occurred.',
        success: false,
      }),
    )
  }
}
