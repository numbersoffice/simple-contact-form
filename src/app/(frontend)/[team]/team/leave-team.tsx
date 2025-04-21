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
import { set } from 'zod'

export default function LeaveTeam({
  userRole,
  teamId,
  teamName,
}: {
  userRole: string
  teamId: string
  teamName: string
}) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

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
            <Button variant="secondary">Leave team</Button>
          </AlertDialogTrigger>
        </CardHeader>
      </Card>

      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You will loose access to any forms of the <span className="font-bold">{teamName} </span>
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
              onClick={(e: FormEvent) => {
                e.preventDefault()
                setLoading(true)
                setTimeout(() => {
                  setOpen(false)
                }, 3000)
                setTimeout(() => {
                  setLoading(false)
                }, 4000)
              }}
            >
              Confirm Leave
            </SubmitButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
