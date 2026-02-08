import CopyableFormId from '@/components/copyable-form-id'
import ElementLock from '@/components/element-lock'
import FormDropdown from '@/components/form-dropdown'
import FormRecipientEditor from '@/components/form-recipient-editor'
import IntegrationGuide from '@/components/integration-guide'
import SpamFilterEditor from '@/components/spam-filter-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import payload from '@/lib/payload'
import { formatDate } from '@/lib/utils'
import { getUser } from '@/lib/utils-server'
import { ChevronLeft, FileText } from 'lucide-react'
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

  if (formData.docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Form not found</p>
        <Link href="./">
          <Button variant="ghost" className="mt-4">
            <ChevronLeft /> Back to forms
          </Button>
        </Link>
      </div>
    )
  }

  const form = formData.docs[0]

  // Extract active recipients from form data
  const formRecipients = form.recipients || []

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

  const activeRecipientCount = recipients.filter((r) => r.active).length

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation */}
      <Link href="./" className="w-fit">
        <Button variant="ghost" size="sm">
          <ChevronLeft className="h-4 w-4" /> All forms
        </Button>
      </Link>

      {/* Form Overview Card */}
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <div className="flex items-start justify-between p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">{form.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Created {formatDate(form.createdAt)}
                </p>
              </div>
            </div>
            <ElementLock locked={!isOwner}>
              <FormDropdown teamId={awaitedParams.team} formId={awaitedParams.form} />
            </ElementLock>
          </div>
          <div className="border-t bg-muted/30 px-6 py-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Form ID</span>
                <CopyableFormId formId={form.formId || ''} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Recipients</span>
                <span className="font-medium">
                  {activeRecipientCount} active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Spam filter</span>
                <span className={`font-medium ${form.spamFilterEnabled ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {form.spamFilterEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="space-y-6">
        <FormRecipientEditor
          formId={awaitedParams.form}
          teamId={awaitedParams.team}
          recipients={recipients}
        />

        <SpamFilterEditor
          formId={awaitedParams.form}
          spamFilterEnabled={form.spamFilterEnabled || false}
          spamFilterPrompt={form.spamFilterPrompt}
          hasOpenAIKey={hasOpenAIKey}
        />

        <IntegrationGuide
          formId={form.formId || ''}
          baseUrl={process.env.NEXT_PUBLIC_HOST_URL || ''}
        />
      </div>
    </div>
  )
}
