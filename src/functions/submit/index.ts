import { NextRequest } from 'next/server'
import type { ServiceDeps } from './types'
import type { Recipient } from '@/payload-types'

export async function handleFormSubmission(
  request: NextRequest,
  params: { form_id: string },
  { payload, checkforSpam, utils, config }: ServiceDeps,
): Promise<Response> {
  const { checkQueryParams, customResponse, extractFormData, successResponse, withCORS } = utils
  const { MAX_BYTES, MAX_FIELDS, MAX_FIELD_LEN, HONEYPOTS } = config

  try {
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
    // const contentType = (request.headers.get('content-type') || '').toLowerCase()
    // const isHtmlForm =
    //   contentType.includes('application/x-www-form-urlencoded') ||
    //   contentType.includes('multipart/form-data')
    const h = request.headers
    const secMode = (h.get('sec-fetch-mode') || '').toLowerCase()
    const secDest = (h.get('sec-fetch-dest') || '').toLowerCase()
    const secUser = (h.get('sec-fetch-user') || '').toLowerCase()
    const accept = (h.get('accept') || '').toLowerCase()
    const xrw = (h.get('x-requested-with') || '').toLowerCase()
    const htmx = (h.get('hx-request') || '').toLowerCase() === 'true'

    let isHtmlForm = false

    if (secMode === 'navigate' || secDest === 'document' || secUser === '?1') isHtmlForm = true
    else if (xrw === 'xmlhttprequest' || xrw === 'fetch' || htmx) isHtmlForm = false
    else if (accept.includes('application/json') && !accept.includes('text/html'))
      isHtmlForm = false
    else if (accept.includes('text/html')) isHtmlForm = true

    console.info(`${isHtmlForm ? 'Html' : 'Programmatic'} form submission received.`)

    // Check if form_id has been provided
    const queryRes = checkQueryParams(params, ['form_id'])
    if (!queryRes.success)
      return withCORS(customResponse(400, { message: queryRes.message, success: false }))
    const formId = params.form_id

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
    if (!formRes || !formRes.docs.length) {
      return withCORS(
        customResponse(400, {
          success: false,
          message: 'Form ID does not exist in database.',
        }),
      )
    }

    const form = formRes.docs[0]

    // Check if form has a team
    const team = form.team
    if (!team || typeof team !== 'object' || !('id' in team))
      return withCORS(
        customResponse(500, {
          message: 'Error: Team field is not set up correctly.',
          success: false,
        }),
      )

    // Check if spam filtering is enabled and API key exists
    const spamFilterEnabled = form.spamFilterEnabled
    const openaiKey = 'openaiKey' in team ? (team.openaiKey as string) : null

    if (spamFilterEnabled && openaiKey && form.spamFilterPrompt) {
      // Check if message is spam
      const isSpam = await checkforSpam(fields, openaiKey, form.spamFilterPrompt)
      if (isSpam) {
        // Log spam
        console.log('Spam detected. Not sending email.')

        // Send regular success response in order to not give away spam detection to malicious actors
        return withCORS(successResponse(isHtmlForm, returnUrl, 'Form submitted.'))
      }
    }

    // Check if recipients field exists
    const recipients = form.recipients
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0)
      return withCORS(
        customResponse(500, {
          message: 'Error: Recipients field is not set up correctly.',
          success: false,
        }),
      )

    // All checks passed
    // Build message
    const message = fields.map((field) => `${field.name}:\n${field.value}\n`).join('\n')

    // Send emails
    try {
      recipients.forEach((r: Recipient | string) => {
        // Skip malformed recipients
        if (typeof r === 'string') return

        payload.sendEmail({
          to: r.email,
          subject: 'Submission - ' + form.name,
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
