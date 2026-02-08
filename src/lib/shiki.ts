import { createHighlighter } from 'shiki'

// Singleton highlighter instance
import type { Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

async function getSingletonHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark', 'aurora-x', 'monokai'],
      langs: ['go', 'jsx', 'html', 'javascript', 'bash'],
    })
  }
  return highlighterPromise
}

export const codeToHtml = async ({ code, language }: { code: string; language: string }) => {
  const highlighter = await getSingletonHighlighter()
  return highlighter.codeToHtml(code, {
    lang: language,
    themes: {
      dark: 'github-dark',
      light: 'aurora-x',
    },
  })
}
