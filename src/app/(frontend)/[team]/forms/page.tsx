import TableHeaderForms from '@/components/table-header-forms'
import TableGridForms, { Form } from '@/components/table-grid-forms'
import payload from '@/lib/payload'
import { getUser } from '@/lib/utils-server'
import { redirect } from 'next/navigation'

export default async function FormsPage({ params }: { params: Promise<{ team: string }> }) {
  const awaitedParams = await params

  const user = await getUser()
  if (!user) return redirect('/login')

  // Get forms
  const res = await payload.find({
    overrideAccess: false,
    disableErrors: true,
    collection: 'forms',
    user,
    where: {
      team: {
        equals: awaitedParams.team,
      },
    },
  })

  const data = res.docs.map((doc) => {
    return {
      id: doc.id,
      formId: doc.formId,
      name: doc.name,
      spamFilterEnabled: doc.spamFilterEnabled || false,
      recipientCount: Array.isArray(doc.recipients) ? doc.recipients.length : 0,
    } as Form
  })

  return (
    <>
      <TableHeaderForms />
      <TableGridForms data={data} />
    </>
  )
}
