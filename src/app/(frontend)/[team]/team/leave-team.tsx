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
import { useRouter } from 'next/navigation'
import { useAppData } from '@/context/app-data'
import { toast } from 'sonner'

export default function LeaveTeam() {
  const router = useRouter()
  const { activeTeam, appUser } = useAppData()

  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  async function handleLeaveTeam(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setLoading(true)

    const res = await fetch(`/api/teams/${activeTeam.id}/members/${appUser.id}`, {
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

      router.push(`/${defaultTeamId}/team`)

      toast.success('You have left ' + activeTeam.name + '. Redirecting to your default team...')
    } else {
      const data = await res.json()
      console.error(data)
      toast.error(data.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Leave team</CardTitle>
            <CardDescription>
              If you leave this team you will loose access to all forms.
            </CardDescription>
          </div>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Leave team</Button>
          </AlertDialogTrigger>
        </CardHeader>
      </Card>

      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You will loose access to any forms of the{' '}
            <span className="font-bold">{activeTeam.name} </span>
            team.
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
              onClick={handleLeaveTeam}
            >
              Confirm Leave
            </SubmitButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
