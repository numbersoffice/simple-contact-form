import payload from '@/lib/payload'
import { getUser } from '@/lib/utils-server'
import { notFound, redirect } from 'next/navigation'
import SettingsForm from './settings-form'

export default async function SettingsPage({ params }: { params: Promise<{ team: string }> }) {
  const awaitedParams = await params

  const user = await getUser()
  if (!user) return redirect('/login')

  // Get team data
  const teamRes = await payload.findByID({
    collection: 'teams',
    id: awaitedParams.team,
  })

  if (!teamRes) return notFound()

  // Check if user is owner
  const isOwner = teamRes.owners?.some((owner) => {
    if (typeof owner !== 'object') return false
    return owner.id === user.id
  })

  if (!isOwner) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-center">
        You do not have permission to access settings.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsForm teamId={awaitedParams.team} openaiKey={teamRes.openaiKey || ''} />
    </div>
  )
}
