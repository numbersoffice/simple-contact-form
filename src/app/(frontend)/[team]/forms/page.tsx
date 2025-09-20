import TableHeaderForms from '@/components/table-header-forms'
import TableGridForms, { Form } from '@/components/table-grid-forms'
import payload from '@/lib/payload'
import { getUser } from '@/lib/utils-server'
import { ColumnDef } from '@tanstack/react-table'
import { redirect } from 'next/navigation'

const columns: ColumnDef<Form>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'id',
    header: 'Form ID',
  },
]

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
      id: doc.formId,
      name: doc.name,
    } as Form
  })

  return (
    <>
      <TableHeaderForms />
      <TableGridForms columns={columns} data={data} />
    </>
  )
}
