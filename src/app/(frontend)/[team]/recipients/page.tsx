import TableHeaderRecipients from '@/components/table-header-recipients'
import TableGridRecipients, { Form } from '@/components/table-grid-recipients'
import payload from '@/lib/payload'
import { getUser } from '@/lib/utils-server'
import { redirect } from 'next/navigation'

export default async function FormsPage({ params }: { params: Promise<{ team: string }> }) {
  const awaitedParams = await params

  const user = await getUser()
  if (!user) return redirect('/login')

  // Get recipients
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

  const data = recipientRes.docs.map((doc) => {
    return {
      id: doc.id,
      email: doc.email,
      status: doc.verified || false,
    } as Form
  })

  return (
    <>
      <TableHeaderRecipients />
      <TableGridRecipients data={data} />
    </>
  )
}
