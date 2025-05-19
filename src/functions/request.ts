/**
 * Transform form data into array with key-value pairs
 * @param formData - Form data object
 */
export function extractFormData(formData: FormData): { name: string; value: string }[] {
  const formDataEntries = formData.entries()

  const fields: { name: string; value: string }[] = []

  for (const [key, value] of formDataEntries) {
    fields.push({ name: key, value: value as string })
  }

  return fields
}

/**
 * Removes utility fields from form data in preparation to send email
 * e.g. redirect, honeypot fields
 * @param fields - Form data fields
 * @param utilityFields - Array of utility fields to remove
 */
export function removeUtilityFields(
  fields: { name: string; value: string }[],
  utilityFields: string[],
) {
  return fields.filter((field) => !utilityFields.includes(field.name))
}

/**
 * Checks if the provided query parameters are present in the request
 * @param params - Params object provided by the request
 * @param requiredParams - Array of required parameters
 */
export function checkQueryParams(params: Record<string, unknown>, requiredParams: string[]) {
  for (const param of requiredParams) {
    if (!params[param]) {
      return { success: false, message: `Missing parameter: ${param}` }
    }
  }

  return { success: true, message: 'All required parameters present' }
}

/**
 * Returns the response and logs the event
 * @param status - Status code to return
 * @param message - Message to log
 * @param logMessage - Optional message to log instead of the message
 */
export function customResponse(
  status: number,
  body: { message: string; success: boolean },
  logMessage?: string,
) {
  console.log(logMessage ? logMessage : body.message)

  return new Response(JSON.stringify(body), {
    status,
  })
}

/**
 * Constructs a new success reponse based on if the request was submitted by an HTML form or programmatically
 * @param isHtmlForm - Boolean indicating if the request was submitted by an HTML form
 * @param redirect - Redirect URL
 * @param message - Message to log
 * @param logMessage - Optional message to log instead of the message
 */
export function successResponse(
  isHtmlForm: boolean,
  redirect: string,
  message: string,
  logMessage?: string,
) {
  console.log(logMessage ? logMessage : message)

  // Inlude redirect for html form submissions
  const formPayload = {
    status: 303,
    headers: {
      Location: redirect,
    },
  }

  // Send only status for programmatic submissions
  const programmaticPayload = {
    status: 200,
  }

  return new Response(
    JSON.stringify({ message, success: true }),
    isHtmlForm ? formPayload : programmaticPayload,
  )
}
