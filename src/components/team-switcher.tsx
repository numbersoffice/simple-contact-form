'use client'

import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'
import * as React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useRouter } from 'next/navigation'
import { ExtendedTeam } from './app-sidebar'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { replaceTeamId } from '@/lib/utils'
import { Invite } from '@/payload-types'
import { useState } from 'react'
import { toast } from 'sonner'
import SubmitButton from './button-submit'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'

export function TeamSwitcher({
  teams,
  activeTeamId,
  activeTeamName,
  invites,
}: {
  teams: ExtendedTeam[]
  activeTeamId: string
  activeTeamName: string
  invites: Invite[]
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [declineIsPending, setDeclineIsPending] = useState<
    { pending: boolean; inviteId: string }[]
  >([])
  const [acceptIsPending, setAcceptIsPending] = useState<{ pending: boolean; inviteId: string }[]>(
    [],
  )

  const activeTeamIndex = teams.findIndex((team) => team.id === activeTeamId)

  /**
   * Creates a new team
   */
  async function handleCreateTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Get the form data
    const form = new FormData(e.currentTarget)
    const name = form.get('name') as string

    setLoading(true)

    // Create the team
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (res.ok) {
      const data = await res.json()
      // Refresh page
      const newUrl = replaceTeamId(window.location.href, data.doc.id)
      router.push(newUrl)
    } else {
      const error = await res.json()
      console.error('Error creating team:', error)
      setLoading(false)
    }

    // Close the dialog
    setDialogOpen(false)
    setLoading(true)
  }

  /**
   * Accepts an invite
   * @param inviteId The ID of the invite to accept
   */
  async function acceptInvite(inviteId: string) {
    setAcceptIsPending((prev) => [...prev, { pending: true, inviteId }])

    // Accept the invite
    const res = await fetch(`/api/invites/${inviteId}/accept`, {
      method: 'POST',
    })
    if (res.ok) {
      const data = await res.json()

      // Refresh page to update teams
      const newUrl = replaceTeamId(window.location.href, data.doc.id)
      router.push(newUrl)
    }
    if (res.status === 401) {
      toast.error('You are not the invitee')
    }
    if (res.status === 404) {
      toast.error('Invite not found')
    }
    if (res.status === 400) {
      toast.error('Invalid team')
    }
    if (res.status === 500) {
      toast.error('Internal server error')
    }
    if (!res.ok) {
      console.error('Error accepting invite:', res.statusText)
      toast.error('Error accepting invite')
    }

    toast.success('Invite accepted')
    setAcceptIsPending((prev) => prev.filter((i) => i.inviteId !== inviteId))
  }

  /**
   * Declines an invite
   * @param inviteId The ID of the invite to decline
   */
  async function declineInvite(inviteId: string) {
    setDeclineIsPending((prev) => [...prev, { pending: true, inviteId }])

    // Delete the invite
    const res = await fetch(`/api/invites/${inviteId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      // Refresh page to update invites
      router.refresh()
    } else {
      console.error('Error declining invite:', res.statusText)
      toast.error('Error declining invite')
      setDeclineIsPending((prev) => prev.filter((i) => i.inviteId !== inviteId))
    }
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {invites.length > 0 && (
                    <Badge className="absolute right-8 border-dashed border-2 bg-amber-200 border-amber-400 text-black font-bold">
                      {invites.length}
                    </Badge>
                  )}
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">
                    {activeTeamName.charAt(0).toUpperCase()}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {teams[activeTeamIndex]?.name || 'Error'}
                    </span>
                    <span className="truncate text-xs capitalize">
                      {teams[activeTeamIndex]?.role || 'Error'}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side={isMobile ? 'bottom' : 'right'}
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Teams
                </DropdownMenuLabel>
                {teams.map((team) => (
                  <DropdownMenuItem
                    key={team.name}
                    onClick={() => {
                      const newUrl = replaceTeamId(window.location.href, team.id, true)
                      router.push(newUrl)
                    }}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm bg-black text-white">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    {team.name}
                  </DropdownMenuItem>
                ))}
                {invites.length > 0 && (
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Invites
                  </DropdownMenuLabel>
                )}
                <div className="flex flex-col gap-1">
                  {invites.map((invite) => {
                    // Check if the invite is pending
                    const declinePending =
                      declineIsPending.find((i) => i.inviteId === invite.id)?.pending || false
                    const acceptPending =
                      acceptIsPending.find((i) => i.inviteId === invite.id)?.pending || false

                    return (
                      <div
                        key={invite.id}
                        className="flex flex-col items-center gap-2 p-2 border-2 border-amber-500 bg-amber-200 border-dashed rounded-md"
                      >
                        <div className="flex w-full gap-2 font-bold">{invite['team-name']}</div>
                        <div className="grid grid-cols-2 gap-1 w-full">
                          <SubmitButton
                            size="sm"
                            variant="secondary"
                            onClick={() => declineInvite(invite.id)}
                            loading={declinePending}
                            disabled={acceptPending || declinePending}
                          >
                            <X />
                            Decline
                          </SubmitButton>
                          <SubmitButton
                            loading={acceptPending}
                            disabled={acceptPending || declinePending}
                            size="sm"
                            onClick={() => acceptInvite(invite.id)}
                          >
                            <Check color="white" />
                            Accept
                          </SubmitButton>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <DropdownMenuSeparator />

                <DialogTrigger className="w-full">
                  <DropdownMenuItem className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">Create team</div>
                  </DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new team</DialogTitle>
            <DialogDescription>
              A team lets you assign forms to a particular organization or project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTeam}>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Team name</Label>
              <Input type="text" id="name" name="name" placeholder="Acme Inc." />
            </div>
            <DialogFooter>
              <SubmitButton loading={loading} className="mt-4">
                Create team
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
