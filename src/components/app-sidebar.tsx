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
import { useAppData } from '@/context/app-data'
import { Invite, Team } from '@/payload-types'
import { LogOut, LucideProps } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import ElementLock from './element-lock'
import { TeamSwitcher } from './team-switcher'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

// Properly extend team type
export interface ExtendedTeam extends Team {
  role: 'owner' | 'member'
}

export function AppSidebar({
  teams,
  activeTeamId,
  invites,
  data,
}: {
  teams: ExtendedTeam[]
  activeTeamId: string
  invites: Invite[]
  data: {
    nav: {
      title: string
      url: string
      icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
      ownerOnly: boolean
    }[]
  }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { userRole } = useAppData()

  // Logout function
  // This function is called when the user clicks the logout button
  // It sends a POST request to the logout endpoint and redirects the user to the login page
  async function logout() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_HOST_URL}/api/app-users/logout`, {
        method: 'POST',
        credentials: 'include',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      router.push('/login')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <TeamSwitcher teams={teams} invites={invites} activeTeamId={activeTeamId} />
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
