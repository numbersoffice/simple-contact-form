'use client'

import PaymentForm from '@/components/payment-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import StripeElementsProvider from '@/context/stripe-elements-provider'
import { AppUser, PaymentMethod } from '@/payload-types'
import { useState } from 'react'

export default function CreditTopUp({
  host,
  protocol,
  user,
  paymentMethods,
}: {
  host: string | null
  protocol: string | null
  user: AppUser
  paymentMethods: PaymentMethod[] | []
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <StripeElementsProvider>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="w-fit">
            Add to credit balance
          </Button>
        </DialogTrigger>
        <DialogContent className="overflow-y-scroll max-h-[calc(100vh-48px)]">
          <DialogHeader>
            <DialogTitle>Add to credit balance</DialogTitle>
            <DialogDescription>
              To complete your purchase, please enter your card details.
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            user={user}
            host={host}
            protocol={protocol}
            onSuccess={() => setDialogOpen(false)}
            paymentMethods={paymentMethods}
          />
        </DialogContent>
      </Dialog>
    </StripeElementsProvider>
  )
}
