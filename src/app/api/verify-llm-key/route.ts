import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Validates a spam-filter API key before it is saved to a team.
// The provider is detected from the key: keys starting with `sk-ant-` are
// Anthropic (Claude) keys, everything else is treated as an OpenAI key.
export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ valid: false, error: 'API key is required' }, { status: 400 })
    }

    if (apiKey.startsWith('sk-ant-')) {
      return verifyAnthropicKey(apiKey)
    }

    return verifyOpenAIKey(apiKey)
  } catch (error) {
    console.error('API key verification failed:', error)
    return NextResponse.json({ valid: false, error: 'Failed to verify API key' }, { status: 500 })
  }
}

async function verifyAnthropicKey(apiKey: string) {
  // A simple authenticated GET verifies the key without spending tokens.
  const res = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  })

  if (res.ok) {
    return NextResponse.json({ valid: true, provider: 'anthropic' })
  }

  if (res.status === 401) {
    return NextResponse.json({ valid: false, error: 'Invalid API key' }, { status: 401 })
  }

  if (res.status === 429) {
    return NextResponse.json(
      { valid: false, error: 'Rate limit exceeded. The key may be valid but has usage limits.' },
      { status: 429 },
    )
  }

  return NextResponse.json({ valid: false, error: 'Failed to verify API key' }, { status: 500 })
}

async function verifyOpenAIKey(apiKey: string) {
  try {
    const openai = new OpenAI({ apiKey })

    // Make a simple API call to verify the key works
    await openai.models.list()

    return NextResponse.json({ valid: true, provider: 'openai' })
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

    return NextResponse.json({ valid: false, error: 'Failed to verify API key' }, { status: 500 })
  }
}
