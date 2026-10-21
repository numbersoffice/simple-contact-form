'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, FormEvent } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

interface SettingsFormProps {
  teamId: string
  hasKey: boolean
}

export default function SettingsForm({ teamId, hasKey }: SettingsFormProps) {
  const [key, setKey] = useState('')
  const [configured, setConfigured] = useState(hasKey)
  const [loading, setLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)

  // Detect the provider from the key so the user knows which service will be used.
  const provider = key.startsWith('sk-ant-') ? 'Anthropic (Claude)' : key ? 'OpenAI' : null

  async function saveKey(value: string) {
    setLoading(true)

    try {
      // Verify the API key first if it's not empty
      if (value) {
        const verifyRes = await fetch('/api/verify-llm-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey: value }),
        })

        const verifyData = await verifyRes.json()

        if (!verifyData.valid) {
          toast.error(verifyData.error || 'Invalid API key')
          setLoading(false)
          return
        }
      }

      const res = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ openaiKey: value }),
      })

      if (res.ok) {
        setConfigured(Boolean(value))
        setKey('')
        toast.success('Settings saved successfully')
      } else {
        const data = await res.json()
        toast.error(data.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while saving settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (key.trim()) await saveKey(key.trim())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spam Filter API Key</CardTitle>
        <CardDescription>
          Add an LLM API key to enable spam filtering. Use an OpenAI key, or an Anthropic key
          (starting with <code className="text-xs">sk-ant-</code>) to filter with Claude. The
          provider is detected automatically from the key.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {configured ? 'An API key is configured. Enter a new key to replace it.' : 'No API key is configured.'}
          </p>
          <div className="space-y-2">
            <Label htmlFor="openai-key">API Key</Label>
            <div className="relative">
              <Input
                id="openai-key"
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {provider && (
              <p className="text-xs text-muted-foreground">
                Detected provider: <span className="font-medium">{provider}</span>
              </p>
            )}
          </div>
          <Button type="submit" disabled={loading || !key.trim()}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
          {configured && (
            <Button type="button" variant="outline" disabled={loading} onClick={() => saveKey('')}>
              Remove key
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
