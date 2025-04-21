'use client'

import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import SubmitButton from './button-submit'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Input } from './ui/input'
import { Label } from './ui/label'

export default function FormDropdown({ teamId, formId }: { teamId: string; formId: string }) {
  const [renameLoading, setRenameLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)

  function closeDialogs() {
    setDeleteDialogOpen(false)
    setRenameDialogOpen(false)
  }

  return (
    <>
      <Dialog
        open={renameDialogOpen || deleteDialogOpen}
        onOpenChange={renameDialogOpen ? setRenameDialogOpen : setDeleteDialogOpen}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" type="button">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Form actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
              <Pencil />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {renameDialogOpen && (
          <RenameDialog
            renameLoading={renameLoading}
            setRenameLoading={setRenameLoading}
            teamId={teamId}
            formId={formId}
            closeDialogs={closeDialogs}
          />
        )}
        {deleteDialogOpen && (
          <DeleteDialog
            deleteLoading={deleteLoading}
            setDeleteLoading={setDeleteLoading}
            teamId={teamId}
            formId={formId}
            closeDialogs={closeDialogs}
          />
        )}
      </Dialog>
    </>
  )
}

function RenameDialog({
  renameLoading,
  teamId,
  setRenameLoading,
  formId,
  closeDialogs,
}: {
  renameLoading: boolean
  teamId: string
  setRenameLoading: (loading: boolean) => void
  formId: string
  closeDialogs: () => void
}) {
  const router = useRouter()
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRenameLoading(true)
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name')
    const team = formData.get('team')

    // Update name in the database
    const res = await fetch(`/api/forms/${formId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, team }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Handle res
    if (res.ok) {
      console.log('Form renamed successfully')
    } else {
      console.error('Error renaming form')
    }

    // Reset
    setRenameLoading(false)
    closeDialogs()
    router.refresh()
  }
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Rename form</DialogTitle>
        <DialogDescription>
          Change the name of your form. This will have no effect on its functionality.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="name">New form name</Label>
          <Input type="text" id="name" name="name" placeholder="Website Contact" />
          <Input type="text" id="team" name="team" className="hidden" defaultValue={teamId} />
        </div>
        <DialogFooter>
          <SubmitButton loading={renameLoading} className="mt-4">
            Save
          </SubmitButton>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function DeleteDialog({
  deleteLoading,
  setDeleteLoading,
  teamId,
  formId,
  closeDialogs,
}: {
  deleteLoading: boolean
  setDeleteLoading: (loading: boolean) => void
  teamId: string
  formId: string
  closeDialogs: () => void
}) {
  const router = useRouter()
  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setDeleteLoading(true)

    const res = await fetch(`/api/forms/${formId}`, {
      method: 'DELETE',
      body: JSON.stringify({ team: teamId }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Handle res
    if (res.ok) {
      router.push(`/${teamId}/forms`)
    } else {
      console.error('Error deleting form')
    }

    // Reset
    setDeleteLoading(false)
    closeDialogs()
  }
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure you want to delete this form?</DialogTitle>
        <DialogDescription className="text-red-600 p-4 bg-red-100 rounded-sm">
          This action is irreversible. Integrations using this form ID will{' '}
          <strong>STOP WORKING</strong>. All data and submissions relating to this form will be
          lost.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleDelete}>
        <DialogFooter>
          <SubmitButton variant="destructive" loading={deleteLoading}>
            Yes, delete this form
          </SubmitButton>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
