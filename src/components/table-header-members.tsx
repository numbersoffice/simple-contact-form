'use client'

import { Plus } from 'lucide-react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import SubmitButton from './button-submit'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { toast } from 'sonner'

export default function RecipientTableHeader({
  teamName,
  userRole,
}: {
  teamName: string
  userRole: string
}) {
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()
  const [teamId, setTeamId] = useState('')
  const _role = userRole.toLowerCase()

  useEffect(() => {
    const url = window.location.href
    const team = url.split('/')[3]
    setTeamId(team)
  }, [])

  async function handleCreateForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Get the form data
    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const team = form.get('team') as string
    const role = form.get('role') as string

    setLoading(true)

    // Create the form
    const res = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, team, role, 'team-name': teamName }),
    })

    if (res.ok) {
      setDialogOpen(false)
      setLoading(false)
      router.refresh()
    } else {
      const error = await res.json()
      console.error('Error sending invite:', error)
      setLoading(false)

      error.errors.forEach((e: Error) => toast.error('Error: ' + e.message))
    }
  }

  return (
    <div className="flex justify-between mb-2 items-center">
      <h3 className="font-semibold">Members</h3>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {_role === 'owner' && (
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus /> Invite member
            </Button>
          </DialogTrigger>
        )}

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>
              We will send an invite for <strong>{teamName}</strong> to the provided email address.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateForm}>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Email</Label>
              <Input type="email" id="email" name="email" placeholder="user@domain.com" />
              <Label htmlFor="role">Role</Label>
              <Select defaultValue="member" name="role">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              <Input type="text" id="team" name="team" className="hidden" defaultValue={teamId} />
            </div>
            <DialogFooter>
              <SubmitButton loading={loading} className="mt-6">
                Send invite
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
