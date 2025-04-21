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

export default function DeleteTeam({
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
            This will remove the <span className="font-bold">{teamName} </span>
            team. This action cannot be undone.
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
              Confirm Delete
            </SubmitButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
