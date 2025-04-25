'use client'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialog,
} from '@/components/ui/alert-dialog'
import { AlertDialogAction, AlertDialogCancel } from '@radix-ui/react-alert-dialog'
import React, { FormEvent } from 'react'
import SubmitButton from '@/components/button-submit'
import { useAppData } from '@/context/app-data'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DeleteTeam() {
  const { activeTeam, appUser } = useAppData()
  const router = useRouter()

  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  async function handleDeleteTeam(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch(`/api/teams/${activeTeam.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (res.ok) {
      setOpen(false)

      // Navigate to default team after leaving
      const defaultTeamId =
        typeof appUser['default-team'] === 'object' && appUser['default-team']?.id

      toast.success('You have deleted ' + activeTeam.name + '. Redirecting to your default team...')
      router.push(`/${defaultTeamId}/team`)
    } else {
      const data = await res.json()
      console.error(data)
      toast.error(data.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <Card className="w-full border-dashed">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Delete team</CardTitle>
            <CardDescription>
              Deleting this team will remove all of its forms and members.
            </CardDescription>
          </div>
          <AlertDialogTrigger asChild>
            <Button variant="secondary">Delete team</Button>
          </AlertDialogTrigger>
        </CardHeader>
      </Card>

      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the team: <span className="font-bold">{activeTeam.name}</span>
          </AlertDialogDescription>
          <AlertDialogDescription className="text-red-600 p-4 bg-red-100 rounded-sm">
            Any forms managed by this team will stop sending submissions. All members and owners
            will be removed from the team. <strong>This action is irreversible.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild disabled={loading}>
            <Button variant="secondary" type="submit">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <SubmitButton
              variant="destructive"
              type="submit"
              loading={loading}
              onClick={handleDeleteTeam}
            >
              Confirm Delete
            </SubmitButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
