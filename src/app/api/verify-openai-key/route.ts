import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ valid: false, error: 'API key is required' }, { status: 400 })
    }

    const openai = new OpenAI({ apiKey })

    // Make a simple API call to verify the key works
    await openai.models.list()

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('OpenAI key verification failed:', error)

    if (error instanceof OpenAI.AuthenticationError) {
      return NextResponse.json({ valid: false, error: 'Invalid API key' }, { status: 401 })
    }

    if (error instanceof OpenAI.RateLimitError) {
      return NextResponse.json(
        { valid: false, error: 'Rate limit exceeded. The key may be valid but has usage limits.' },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { valid: false, error: 'Failed to verify API key' },
      { status: 500 },
    )
  }
}
