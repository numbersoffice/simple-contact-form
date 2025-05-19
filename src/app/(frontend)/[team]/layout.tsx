import Dashboard from '@/components/dashboard'
import React from 'react'
import { headers as NextHeaders } from 'next/headers'
import payload from '@/lib/payload'
import { ExtendedTeam } from '@/components/app-sidebar'
import { AppDataProvider } from '@/context/app-data'
import { redirect } from 'next/navigation'

export default async function Layout(props: {
  children: React.ReactNode
  params: Promise<{ team: string }>
}) {
  const { team } = await props.params

  // Get user
  const headers = await NextHeaders()
  const authResult = await payload.auth({ headers })
  const user = authResult.user
  if (user?.collection !== 'app-users') redirect('/login')

  // Get users teams
  const { docs } = await payload.find({
    collection: 'teams',
    overrideAccess: false,
    disableErrors: true,
    user,
  })

  // Get app-user
  const appUser = await payload.findByID({
    collection: 'app-users',
    id: user.id,
  })
  if (!appUser) return null

  const teams: ExtendedTeam[] = docs.map((team) => {
    // Make sure owners are defined
    if (!team.owners) return { ...team, role: 'member' }

    // Check if user is owner of team
    const owner =
      typeof team.owners === 'object'
        ? team.owners?.find((owner) => {
            if (typeof owner === 'string') return false
            else return owner.id === user.id
          })
        : null
    return { ...team, role: owner ? 'owner' : 'member' }
  })

  // Get invites for user
  const invites = await payload.find({
    collection: 'invites',
    where: {
      email: {
        equals: user.email,
      },
    },
  })

  const currentTeam = teams.find((t) => t.id === team)

  if (!currentTeam) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="bg-red-400 p-4 rounded-md text-center md:w-[400px] mx-auto">
          We couldn&apos;t find the team you are looking for. Please check your URL.
        </div>
      </div>
    )
  }

  // Get user role
  const userRole = currentTeam.owners?.some((owner) => {
    if (typeof owner === 'object') {
      return owner.id === user.id
    }
    return false
  })
    ? 'owner'
    : 'member'

  return (
    <AppDataProvider team={currentTeam} appUser={appUser} userRole={userRole}>
      <Dashboard teams={teams} activeTeamId={team || teams[0].id} invites={invites.docs}>
        {props.children}
      </Dashboard>
    </AppDataProvider>
  )
}
