import FormRecipientEditor from '@/components/form-recipient-editor'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import payload from '@/lib/payload'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { ChevronLeft, EllipsisVertical } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { getUser } from '@/lib/utils-server'
import { redirect } from 'next/navigation'
import FormDropdown from '@/components/form-dropdown'

export default async function FormPage({ params }: { params: { team: string; form: string } }) {
  const awaitedParams = await params

  const user = await getUser()
  if (!user) return redirect('/login')

  // Get form data
  const formData = await payload.find({
    collection: 'forms',
    where: {
      id: { equals: awaitedParams.form },
    },
  })

  // Extract active recipients from form data
  const formRecipients = formData.docs[0].recipients || []

  // Find all recipients for the team
  const recipientRes = await payload.find({
    overrideAccess: false,
    disableErrors: true,
    collection: 'recipients',
    user,
    where: {
      team: {
        equals: awaitedParams.team,
      },
    },
  })

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
      <div className="p-4 mt-4">
        {!formData.docs.length ? (
          'Form not found'
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">
                  Created on {formatDate(formData.docs[0].createdAt)}
                </p>
                <h1 className="text-4xl font-bold">{formData.docs[0].name}</h1>
              </div>{' '}
              <FormDropdown teamId={awaitedParams.team} formId={awaitedParams.form} />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Form ID</h3>
              <p className="p-2 px-4 bg-muted rounded-md w-fit font-mono">{formData.docs[0].id}</p>
            </div>

            <FormRecipientEditor
              formId={awaitedParams.form}
              teamId={awaitedParams.team}
              recipients={recipients}
            />
          </div>
        )}
      </div>
    </div>
  )
}
