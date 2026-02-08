'use client'

import SubmitButton from '@/components/button-submit'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CircleCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const DEFAULT_SPAM_PROMPT =
  'This is a general contact form. Filter out spam, promotional content, automated submissions, and messages that are not genuine contact attempts from real people seeking to communicate.'

export default function SpamFilterEditor({
  formId,
  spamFilterEnabled,
  spamFilterPrompt,
  hasOpenAIKey,
}: {
  formId: string
  spamFilterEnabled: boolean
  spamFilterPrompt?: string | null
  hasOpenAIKey: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [savingPrompt, setSavingPrompt] = useState(false)
  const [prompt, setPrompt] = useState(spamFilterPrompt || DEFAULT_SPAM_PROMPT)

  async function toggleSpamFilter() {
    setLoading(true)

    const res = await fetch(`/api/forms/${formId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spamFilterEnabled: !spamFilterEnabled,
        // If enabling and no prompt exists, set the default
        ...(!spamFilterEnabled && !spamFilterPrompt && { spamFilterPrompt: DEFAULT_SPAM_PROMPT }),
      }),
    })

    const data = await res.json()

    if (res.ok) {
      toast.success(`Spam filter is ${spamFilterEnabled ? 'turned off' : 'turned on'}.`)
      router.refresh()
    } else {
      console.log(data)
      toast.error(data.errors?.[0]?.message || 'Failed to update spam filter')
    }

    setLoading(false)
  }

  async function savePrompt() {
    setSavingPrompt(true)

    const res = await fetch(`/api/forms/${formId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spamFilterPrompt: prompt,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      toast.success('Spam filter prompt saved.')
      router.refresh()
    } else {
      console.log(data)
      toast.error(data.errors?.[0]?.message || 'Failed to save prompt')
    }

    setSavingPrompt(false)
  }

  const hasPromptChanged = prompt !== (spamFilterPrompt || DEFAULT_SPAM_PROMPT)

  return (
    <Card className={`relative overflow-hidden ${!hasOpenAIKey && 'pb-0'}`}>
      <CardContent className={`flex flex-col gap-4 ${!hasOpenAIKey && 'opacity-30'}`}>
        <div className="flex justify-between gap-4">
          <div className="flex gap-2">
            <CircleCheck
              className={`shrink-0 w-[18px] ${spamFilterEnabled && hasOpenAIKey ? 'text-blue-500' : 'text-muted-foreground'}`}
            />
            <div className="w-fit">
              <h3 className="font-semibold">
                Spam Filter {spamFilterEnabled && hasOpenAIKey ? 'is on' : 'is off'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Use an LLM to automatically filter spam submissions before they reach your inbox.
              </p>
            </div>
          </div>
          <SubmitButton
            loading={loading}
            disabled={!hasOpenAIKey}
            onClick={toggleSpamFilter}
            className="self-center"
            variant={spamFilterEnabled ? 'secondary' : 'default'}
          >
            {spamFilterEnabled ? 'Turn off' : 'Turn on'}
          </SubmitButton>
        </div>

        {/* Expanded prompt editor when enabled */}
        {spamFilterEnabled && hasOpenAIKey && (
          <div className="flex flex-col gap-3 pt-4 border-t -mx-6 px-6">
            <div>
              <h4 className="text-sm font-medium mb-1">Filter Prompt</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Describe the purpose of your form and if there are any specific types of submissions
                you want to filter.
              </p>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='For example: "This is a general contact form. Filter out spam, promotional content, automated submissions, and messages that are not genuine contact attempts from real people."'
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end gap-2">
              <SubmitButton
                loading={savingPrompt}
                disabled={!hasPromptChanged}
                onClick={savePrompt}
                variant="outline"
                size="sm"
              >
                Save Prompt
              </SubmitButton>
            </div>
          </div>
        )}
      </CardContent>

      {/* Unavailability message */}
      {!hasOpenAIKey && (
        <div className="text-sm p-4 py-2 bg-amber-400 w-full">
          Add an OpenAI API key in team settings to enable the spam filter.
        </div>
      )}
    </Card>
  )
}
