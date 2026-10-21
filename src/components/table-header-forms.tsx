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

export default function TableHeaderForms() {
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()
  const { team: teamId } = useParams<{ team: string }>()

  async function handleCreateForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Get the form data
    const form = new FormData(e.currentTarget)
    const name = form.get('name') as string
    const team = form.get('team') as string

    setLoading(true)

    // Create the form
    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, team }),
    })

    if (res.ok) {
      setDialogOpen(false)
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <div className="flex justify-end mb-2">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus /> Create form
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create form</DialogTitle>
            <DialogDescription>Group submissions to particular topics.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateForm}>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Form name</Label>
              <Input type="text" id="name" name="name" placeholder="Website Contact" />
              <Input type="text" id="team" name="team" className="hidden" defaultValue={teamId} />
            </div>
            <DialogFooter>
              <SubmitButton loading={loading} className="mt-4">
                Create form
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
