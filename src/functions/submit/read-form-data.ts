export class PayloadTooLargeError extends Error {}

// Enforce the limit on actual bytes, including multipart headers and file uploads,
// before allowing the form parser to allocate memory for fields.
export async function readLimitedFormData(request: Request, maxBytes: number): Promise<FormData> {
  const reader = request.body?.getReader()
  if (!reader) return new FormData()

  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > maxBytes) {
        await reader.cancel()
        throw new PayloadTooLargeError('Payload too large.')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new Response(body, { headers: request.headers }).formData()
}
