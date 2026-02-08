import CopyableFormId from '@/components/copyable-form-id'
import ElementLock from '@/components/element-lock'
import FormDropdown from '@/components/form-dropdown'
import FormRecipientEditor from '@/components/form-recipient-editor'
import SpamFilterEditor from '@/components/spam-filter-editor'
import { Button } from '@/components/ui/button'
import payload from '@/lib/payload'
import { formatDate } from '@/lib/utils'
import { getUser } from '@/lib/utils-server'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function FormPage({
  params,
}: {
  params: Promise<{ team: string; form: string }>
}) {
  const awaitedParams = await params

  const user = await getUser()
  if (!user) return redirect('/login')

  // Get team data
  const teamRes = await payload.find({
    collection: 'teams',
    user,
    overrideAccess: false,
    where: {
      id: { equals: awaitedParams.team },
    },
  })

  if (!teamRes.docs.length) {
    return redirect('/login')
  }

  const team = typeof teamRes.docs[0] === 'object' && teamRes.docs[0]
  if (!team) return redirect('/login')
  const owners = team.owners?.length ? team.owners : []
  const hasOpenAIKey = !!team.openaiKey

  // Check if the user is an owner of the team
  const isOwner = owners.some((owner) => {
    if (typeof owner === 'object') {
      return owner.id === user.id
    }
    return false
  })

  const [formData, recipientRes] = await Promise.all([
    // Get form data
    payload.find({
      collection: 'forms',
      overrideAccess: false,
      user,
      where: {
        id: { equals: awaitedParams.form },
      },
      limit: 1,
    }),
    // Find all recipients for the team
    payload.find({
      overrideAccess: false,
      collection: 'recipients',
      user,
      where: {
        team: {
          equals: awaitedParams.team,
        },
      },
    }),
  ])

  // Extract active recipients from form data
  const formRecipients = formData.docs[0].recipients || []

  // Compare the recipients with the form recipients
  // and set the active status accordingly
  const recipients = recipientRes.docs.map((recipient) => {
    return {
      id: recipient.id,
      email: recipient.email,
      active: formRecipients.some((formRecipient) =>
        typeof formRecipient === 'object' ? formRecipient.id === recipient.id : false,
      ),
    }
  })

  return (
    <div className="flex flex-col">
      {formData.docs.length === 0 ? (
        'Form not found'
      ) : (
        <div className="flex flex-col gap-8">
          <Link href="./" className="w-fit">
            <Button variant="ghost">
              <ChevronLeft /> back
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Created on {formatDate(formData.docs[0].createdAt)}
              </p>
              <h1 className="text-4xl font-bold">{formData.docs[0].name}</h1>
            </div>
            <ElementLock locked={!isOwner}>
              <FormDropdown teamId={awaitedParams.team} formId={awaitedParams.form} />
            </ElementLock>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Form ID</h3>
            <CopyableFormId formId={formData.docs[0].formId || ''} />
          </div>

          <FormRecipientEditor
            formId={awaitedParams.form}
            teamId={awaitedParams.team}
            recipients={recipients}
          />

          <SpamFilterEditor
            formId={awaitedParams.form}
            spamFilterEnabled={formData.docs[0].spamFilterEnabled || false}
            spamFilterPrompt={formData.docs[0].spamFilterPrompt}
            hasOpenAIKey={hasOpenAIKey}
          />
        </div>
      )}
    </div>
  )
}
