import { buildAgentGuideMarkdown } from '@/data/agent-guide'

const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || 'https://simplecontactform.org'

// Served at /llms.txt — the conventional machine-readable entry point for agents.
export function GET() {
  return new Response(buildAgentGuideMarkdown(baseUrl), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
