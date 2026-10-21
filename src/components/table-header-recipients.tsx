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
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function TableHeaderRecipients() {
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()
  const { team: teamId } = useParams<{ team: string }>()

  async function handleCreateForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Get the form data
    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const team = form.get('team') as string

    setLoading(true)

    // Create the form
    const res = await fetch('/api/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, team }),
    })

    if (res.ok) {
      setDialogOpen(false)
      setLoading(false)
      router.refresh()
    } else {
      const error = await res.json()
      console.error('Error creating form:', error)
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-end mb-2">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus /> Add email
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add recipient</DialogTitle>
            <DialogDescription>
              We will send a verification email to this address so it can be used to receive form
              submissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateForm}>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Email</Label>
              <Input type="email" id="email" name="email" placeholder="user@domain.com" />
              <Input type="text" id="team" name="team" className="hidden" defaultValue={teamId} />
            </div>
            <DialogFooter>
              <SubmitButton loading={loading} className="mt-4">
                Send verification
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
