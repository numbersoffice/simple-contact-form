export default async function checkforSpam(
  fields: { name: string; value: string }[],
  apiKey: string,
  customPrompt: string,
): Promise<boolean> {
  // Transform fields into message for llm
  const message = fields.map((field) => field.name + ': ' + field.value + '\n').join(' ')

  // Make direct fetch call to OpenAI API
  // so user key is used
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: customPrompt,
        },
        { role: 'user', content: message },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'spam_check',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              spam: { type: 'boolean' },
            },
            required: ['spam'],
            additionalProperties: false,
          },
        },
      },
    }),
  })

  if (!response.ok) {
    console.error('OpenAI API error:', response.status, response.statusText)
    // If the API call fails, don't block the submission - just skip spam check
    console.error('Failed to check for spam, allowing submission to proceed.')
    return false
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    console.error('No content in OpenAI response')
    return false
  }

  const parsedRes = JSON.parse(content)
  return parsedRes.spam
}
