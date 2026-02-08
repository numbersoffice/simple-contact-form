'use client'

import { Invite } from '@/payload-types'
import { FileText, LogOut, MailCheck, MenuIcon, Settings, Users, X } from 'lucide-react'
import { AppSidebar, ExtendedTeam } from './app-sidebar'
import { TeamSwitcher } from './team-switcher'
import { Button } from './ui/button'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from './ui/sidebar'
import ElementLock from './element-lock'
import { useAppData } from '@/context/app-data'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Dashboard({
  children,
  teams,
  activeTeamId,
  invites,
}: {
  children: React.ReactNode
  teams: ExtendedTeam[]
  activeTeamId: string
  invites: Invite[]
}) {
  const pathname = usePathname()
  const { userRole } = useAppData()
  const router = useRouter()

  const [mobileMenuActive, setMobileMenuActive] = useState(false)

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
        title: 'Settings',
        url: `/${activeTeamId}/settings`,
        icon: Settings,
        ownerOnly: true,
      }
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

  return (
    <SidebarProvider>
      <AppSidebar data={data} teams={teams} activeTeamId={activeTeamId} invites={invites} />

      <main className="w-full">
        <div className="flex items-center p-2 px-4 justify-between md:hidden">
          <div className="w-fit">
            <TeamSwitcher teams={teams} invites={invites} activeTeamId={activeTeamId} />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuActive((prev) => !prev)}
          >
            {mobileMenuActive ? <X /> : <MenuIcon />}
          </Button>
        </div>
        {mobileMenuActive && (
          <div className="p-4">
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
            <SidebarMenuButton asChild>
              <div className="cursor-pointer mt-1" onClick={logout}>
                <LogOut />
                <span>Log out</span>
              </div>
            </SidebarMenuButton>
          </div>
        )}
        {children}
      </main>
    </SidebarProvider>
  )
}
