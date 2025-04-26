'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { AppUser, Invite, Team } from '@/payload-types'
import { FileText, LogOut, MailCheck, Settings, Users, Wallet } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { TeamSwitcher } from './team-switcher'
import { useAppData } from '@/context/app-data'
import ElementLock from './element-lock'

// Properly extend team type
export interface ExtendedTeam extends Team {
  role: 'owner' | 'member'
}

export function AppSidebar({
  user,
  teams,
  activeTeamId,
  invites,
}: {
  user: AppUser
  teams: ExtendedTeam[]
  activeTeamId: string
  invites: Invite[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { userRole } = useAppData()

  const data = {
    nav: [
      {
        title: 'Forms',
        url: `/${activeTeamId}/forms`,
        icon: FileText,
        ownerOnly: false,
      },
      {
        title: 'Recipients',
        url: `/${activeTeamId}/recipients`,
        icon: MailCheck,
        ownerOnly: false,
      },
      {
        title: 'Team',
        url: `/${activeTeamId}/team`,
        icon: Users,
        ownerOnly: false,
      },
      {
        title: 'Credits',
        url: `/${activeTeamId}/billing`,
        icon: Wallet,
        ownerOnly: true,
      },
    ],
  }

  // Logout function
  // This function is called when the user clicks the logout button
  // It sends a POST request to the logout endpoint and redirects the user to the login page
  async function logout() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_HOST_URL}/api/app-users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      router.push('/login')
    } catch (err) {
      console.log(err)
    }
  }

  const activeTeamName = teams.find((team) => team.id === activeTeamId)?.name

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher
          teams={teams}
          invites={invites}
          activeTeamId={activeTeamId}
          activeTeamName={activeTeamName || ''}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.nav.map((item) => {
                const locked = item.ownerOnly && userRole !== 'owner'
                return (
                  <ElementLock locked={locked} key={item.title} side="right" sideOffset={-150}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a
                          href={item.url}
                          className={pathname.includes(item.url) ? 'border-gray-300 font-bold' : ''}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </ElementLock>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton asChild>
          <div className="cursor-pointer" onClick={logout}>
            <LogOut />
            <span>Log out</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
