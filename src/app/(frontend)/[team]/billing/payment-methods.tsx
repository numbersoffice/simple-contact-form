'use client'

import PaymentMethodForm from '@/components/payment-method-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import StripeElementsProvider from '@/context/stripe-elements-provider'
import { AppUser, PaymentMethod } from '@/payload-types'
import { CreditCard, Plus, Replace } from 'lucide-react'
import { useState } from 'react'

export default function PaymentMethods({ data, user }: { data: PaymentMethod[]; user: AppUser }) {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)

  // For conveniences
  const hasPaymentMethods = data.length > 0

  return (
    <StripeElementsProvider>
      <Card>
        <CardHeader>
          <CardTitle>Saved Payment Method</CardTitle>
          <CardDescription>Save a payment method to enable auto recharge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {data.length > 0 ? (
              data.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between space-x-2 rounded-md border p-4"
                >
                  <div className="flex items-center space-x-4">
                    <Label htmlFor={`card-${method.id}`} className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div className="grid gap-0.5">
                        <span className="font-medium">
                          {method.cardBrand.toUpperCase()} •••• {method.lastFour}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </span>
                      </div>
                    </Label>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-center text-muted-foreground border-dashed rounded-md border-[1px] p-8 py-4">
                No payment method added, yet
              </div>
            )}
          </div>

          <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                {data.length > 0 ? (
                  <Replace className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {data.length > 0 ? 'Replace Payment Method' : 'Add Payment Method'}
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-y-scroll max-h-[calc(100vh-48px)]">
              <DialogHeader>
                <DialogTitle>
                  {hasPaymentMethods ? 'Update payment method' : 'Add payment method'}
                </DialogTitle>
                <DialogDescription>
                  Add a payment method for future payments or to automatically recharge your
                  balance.
                </DialogDescription>
              </DialogHeader>
              <PaymentMethodForm
                user={user}
                onSuccess={() => setIsAddCardOpen(false)}
                isUpdate={hasPaymentMethods}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </StripeElementsProvider>
  )
}
