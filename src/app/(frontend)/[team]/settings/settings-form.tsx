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
  openaiKey: string
}

export default function SettingsForm({ teamId, openaiKey }: SettingsFormProps) {
  const [key, setKey] = useState(openaiKey)
  const [loading, setLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      // Verify the API key first if it's not empty
      if (key) {
        const verifyRes = await fetch('/api/verify-openai-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey: key }),
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
        body: JSON.stringify({ openaiKey: key }),
      })

      if (res.ok) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpenAI API Key</CardTitle>
        <CardDescription>
          Add your OpenAI API key to enable spam filtering.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
