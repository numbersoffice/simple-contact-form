type Field = { name: string; value: string }

/**
 * Decides whether a form submission is spam using the team's own LLM API key.
 *
 * The provider is detected from the key itself: keys beginning with `sk-ant-`
 * are Anthropic (Claude) keys, everything else is treated as an OpenAI key.
 * This keeps a single key field on the team while supporting either provider.
 *
 * If the LLM call fails for any reason we fail open (return false) so a provider
 * outage never blocks legitimate submissions.
 */
export default async function checkforSpam(
  fields: Field[],
  apiKey: string,
  customPrompt: string,
): Promise<boolean> {
  // Transform fields into a single message for the LLM
  const message = fields.map((field) => field.name + ': ' + field.value + '\n').join(' ')

  if (apiKey.startsWith('sk-ant-')) {
    return checkWithAnthropic(message, apiKey, customPrompt)
  }

  return checkWithOpenAI(message, apiKey, customPrompt)
}

async function checkWithOpenAI(
  message: string,
  apiKey: string,
  customPrompt: string,
): Promise<boolean> {
  // Make direct fetch call to OpenAI API so the user's key is used
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: customPrompt },
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

async function checkWithAnthropic(
  message: string,
  apiKey: string,
  customPrompt: string,
): Promise<boolean> {
  // Make direct fetch call to the Anthropic Messages API so the user's key is used.
  // A constrained JSON schema guarantees a boolean response we can parse safely.
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system: customPrompt,
      messages: [{ role: 'user', content: message }],
      output_config: {
        format: {
          type: 'json_schema',
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
    console.error('Anthropic API error:', response.status, response.statusText)
    // If the API call fails, don't block the submission - just skip spam check
    console.error('Failed to check for spam, allowing submission to proceed.')
    return false
  }

  const data = await response.json()
  // Responses are a list of content blocks; the structured output lands in a text block.
  const content = data.content?.find((block: { type: string }) => block.type === 'text')?.text

  if (!content) {
    console.error('No content in Anthropic response')
    return false
  }

  const parsedRes = JSON.parse(content)
  return parsedRes.spam
}
