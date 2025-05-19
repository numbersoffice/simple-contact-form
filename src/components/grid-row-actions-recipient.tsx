'use client'

import { MailX, MoreHorizontal, Repeat } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export default function GridRowActionsRecipientInvite({
  teamId,
  recipientId,
  pending,
}: {
  teamId: string
  recipientId: string
  pending: boolean
}) {
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
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {pending && (
              <>
                <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
                  <Repeat color="black" />
                  Resend
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <MailX /> {pending ? 'Revoke' : 'Remove'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {renameDialogOpen && (
          <ResendDialog
            renameLoading={renameLoading}
            setRenameLoading={setRenameLoading}
            docId={recipientId}
            closeDialogs={closeDialogs}
          />
        )}
        {deleteDialogOpen && (
          <DeleteDialog
            deleteLoading={deleteLoading}
            setDeleteLoading={setDeleteLoading}
            docId={recipientId}
            teamId={teamId}
            closeDialogs={closeDialogs}
          />
        )}
      </Dialog>
    </>
  )
}

function ResendDialog({
  renameLoading,
  setRenameLoading,
  docId,
  closeDialogs,
}: {
  renameLoading: boolean
  setRenameLoading: (loading: boolean) => void
  docId: string
  closeDialogs: () => void
}) {
  const router = useRouter()
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRenameLoading(true)

    const res = await fetch(`/api/recipients/${docId}/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Handle res
    if (res.ok) {
      toast.success('Verification email sent')
    } else {
      const error = await res.json()
      console.log(error)
      toast.error(error?.message)
    }

    // Reset
    setRenameLoading(false)
    closeDialogs()
    router.refresh()
  }
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Resend verification?</DialogTitle>
        <DialogDescription>
          This will send a new verification link to the specified email.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogFooter>
          <SubmitButton loading={renameLoading} className="mt-4">
            Resend verification
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
  docId,
  closeDialogs,
}: {
  deleteLoading: boolean
  setDeleteLoading: (loading: boolean) => void
  teamId: string
  docId: string
  closeDialogs: () => void
}) {
  const router = useRouter()
  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setDeleteLoading(true)

    const res = await fetch(`/api/recipients/${docId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Handle res
    if (res.ok) {
      toast.success('Removed recipient')
      router.push(`/${teamId}/recipients`)
    } else {
      const error = await res.json()
      console.log(error)
      toast.error(error?.message)
    }

    // Reset
    setDeleteLoading(false)
    closeDialogs()
  }
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure you want to remove this recipient?</DialogTitle>
        <DialogDescription>
          This will prevent any forms from sending submissions to this recipient.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleDelete}>
        <DialogFooter>
          <SubmitButton variant="destructive" loading={deleteLoading}>
            Remove recipient
          </SubmitButton>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
