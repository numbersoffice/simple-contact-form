'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Checkbox } from './ui/checkbox'
import { Loader2 } from 'lucide-react'

export default function FormRecipientEditor({
  formId,
  recipients,
  teamId,
}: {
  formId: string
  recipients: { id: string; email: string; active: boolean }[]
  teamId: string
}) {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const activeCount = recipients.filter((r) => r.active).length

  async function handleChange(recipientId: string) {
    setUpdatingId(recipientId)

    // Check if the recipient is already active
    const recipient = recipients.find((r) => r.id === recipientId)
    if (recipient) {
      // Toggle the active state
      recipient.active = !recipient.active

      // Create array with ids of active recipients
      const activeRecipients = recipients.filter((r) => r.active).map((r) => r.id)

      // Update the form with the new active recipients
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipients: activeRecipients }),
      })

      if (res.ok) {
        router.refresh()
      }
    }

    setUpdatingId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold">Recipients</h3>
          <p className="text-sm text-muted-foreground">
            Select which addresses receive form submissions.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        {recipients.length > 0 ? (
          <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
            {recipients.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                  updatingId === r.id ? 'opacity-60' : ''
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {updatingId === r.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Checkbox
                      checked={r.active}
                      onCheckedChange={() => handleChange(r.id)}
                      disabled={updatingId !== null}
                    />
                  )}
                </div>
                <span
                  className={`text-sm ${r.active ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {r.email}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No verified recipients available.{' '}
              <Link className="underline hover:text-foreground" href={`/${teamId}/recipients`}>
                Add recipients
              </Link>
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-2">Changes are saved automatically.</p>
    </div>
  )
}
