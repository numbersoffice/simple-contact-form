import openai from '@/lib/openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

export default async function checkforSpam(fields: { name: string; value: string }[]) {
  // Prompt for spam analysis
  const spamAnalysisPrompt =
    'I am a spam detection bot. Please provide me a message with fields represented by key:value pairs. I will reply with true if it is spam, or false if it is not. The categories I will mark as spam are: Advertisements, Inquiries with clearly lacking information or context, scams, gibberish. Categories I will not mark as spam include but are not limited to: General inquiries, feedback, questions, comments, and transactional emails.'

  // Transform fields into message for llm
  const message = fields.map((field) => field.name + ': ' + field.value + '\n').join(' ')

  // Set expected response structure
  const spamAnalysisEvent = z.object({
    spam: z.boolean(),
  })

  // Send request to Open AI
  const spamBotResponse = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: spamAnalysisPrompt,
      },
      { role: 'user', content: message },
    ],
    model: 'gpt-4o-mini',
    response_format: zodResponseFormat(spamAnalysisEvent, 'event'),
  })

  // Parse response
  const openaiRes = spamBotResponse.choices[0].message.content as string
  const parsedRes = JSON.parse(openaiRes)

  return parsedRes.spam
}
