'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Badge } from './ui/badge'

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
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleChange(recipientId: string) {
    // Handle recipient change logic here
    console.log(`Recipient ${recipientId} clicked`)

    // Check if the recipient is already active
    const recipient = recipients.find((r) => r.id === recipientId)
    if (recipient) {
      // Toggle the active state
      recipient.active = !recipient.active

      // Create array with ids of active recipients
      const activeRecipients = recipients.filter((r) => r.active).map((r) => r.id)

      setIsUpdating(true)

      // Update the form with the new active recipients
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipients: activeRecipients }),
      })

      if (res.ok) {
        console.log('Form updated successfully')
        router.refresh()
      }

      setIsUpdating(false)
    }
  }
  return (
    <div>
      <div>
        <h2 className="font-semibold">Recipients</h2>
        <p className="text-sm text-gray-500 mt-2 mb-4">
          Click addresses to toggle between{' '}
          <Badge variant="outline" className="text-gray-700">
            Inactive
          </Badge>{' '}
          and <Badge className="bg-blue-500 text-white">Receiving submissions</Badge> (Changes are
          saved automatically)
        </p>
      </div>
      <div className="rounded-md border-[1px] border-gray-200 p-4 flex gap-2">
        {recipients.length > 0 ? (
          recipients.map((r) => (
            <Badge
              className={`cursor-pointer hover:opacity-90 ${r.active ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
              variant={r.active ? 'default' : 'outline'}
              key={r.id}
              onClick={() => handleChange(r.id)}
            >
              {r.email}
            </Badge>
          ))
        ) : (
          <p className="text-sm mx-auto text-gray-400">
            No verified recipients availalable. Check their status{' '}
            <Link className="underline" href={`/${teamId}/recipients`}>
              here
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}
