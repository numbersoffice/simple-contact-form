'use client'

import { useAppData } from '@/app/context/app-data'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { CreditCard, LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { toast } from 'sonner'
import { AppUser, PaymentMethod } from '@/payload-types'

export default function PaymentForm({
  user,
  host,
  protocol,
  onSuccess,
  paymentMethods,
}: {
  user: AppUser
  host: string | null
  protocol: string | null
  onSuccess: () => void
  paymentMethods: PaymentMethod[] | []
}) {
  const router = useRouter()
  const { activeTeam } = useAppData()

  // Data
  const successUrl = `${protocol}://${host}/payment-success?email=${user.email}`

  // Stripe initialization
  const stripe = useStripe()
  const elements = useElements()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [amountInput, setAmountInput] = useState('')
  const [cardComplete, setCardComplete] = useState(false)
  const [savePaymentMethod, setSavePaymentMethod] = useState(false)

  const hasPaymentMethod = paymentMethods.length > 0

  /**
   * Handle payment submissions for one time payments or future use
   * @param event
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Check if stripe has been initialized
    if (!stripe || !elements) {
      toast.error('Unknown error: Please reload the page and try again.')
      return
    }

    // Start spinner
    setLoading(true)

    // Get form data
    const formData = new FormData(event.currentTarget)

    const amountString = formData.get('amount') as string
    const futureUseString = formData.get('future-use') as string
    const autoRechargeString = formData.get('auto-recharge') as string

    const amount = Math.round(parseFloat(amountString) * 100) // convert to cents
    const futureUse = futureUseString === 'on' // convert to boolean
    const autoRecharge = autoRechargeString === 'on' // convert to boolean

    // Get payment intent client secret
    const paymentIntentRes = await fetch('/api/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        user: user.id,
        email: user.email,
        team: activeTeam.id,
        futureUse,
        autoRecharge,
      }),
    })
    const { clientSecret, error } = await paymentIntentRes.json()

    if (!clientSecret || error) {
      toast.error('There has been an issue with your payment. Please try again.')
      setLoading(false)
      return
    }

    // Retrieve card info from Stripe Elements
    const cardElement = elements.getElement(CardElement)
    if (!cardElement && !hasPaymentMethod) {
      toast.error('There has been an issue with your payment. Please try again.')
      setLoading(false)
      return
    }

    // Check if using saved card or new card
    // Then initiate one time charge
    if (hasPaymentMethod) {
      // Use saved card
      const paymentMethodId = paymentMethods[0].stripePaymentMethodId
      const paymentMethodRes = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
      })
      if (paymentMethodRes.error) {
        toast.error(paymentMethodRes.error.message || 'An unexpected error occurred.')
        setLoading(false)
        return
      }
    } else {
      if (!cardElement) {
        toast.error('There has been an issue with your payment. Please try again.')
        setLoading(false)
        return
      }
      // Use new card
      const oneTimePaymentRes = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email: user.email },
          metadata: {
            team: activeTeam.id,
            user: user.id,
          },
        },
        return_url: successUrl,
      })

      if (oneTimePaymentRes.error) {
        toast.error(oneTimePaymentRes.error.message || 'An unexpected error occurred.')
        setLoading(false)
        return
      }
    }

    // Success
    // Wait for webhook to come through, then close dialog and refresh page
    setTimeout(() => {
      router.refresh()
      setLoading(false)
      toast.success(`Payment successful!`)
      onSuccess()
    }, 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col relative">
      <Label htmlFor="amount" className="mb-2">
        Amount to add
      </Label>
      <div className="relative">
        <div className="absolute left-[10px] top-[6px] italic">$</div>
        <Input
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          name="amount"
          type="number"
          id="amount"
          className="pl-[26px]"
        />
        <p className="text-xs text-muted-foreground mt-2">Enter an amount between $1 and $100</p>
      </div>
      <Label htmlFor="card-element" className="mb-2 mt-6">
        {hasPaymentMethod ? 'Using saved card' : 'Card information'}
      </Label>
      {!hasPaymentMethod && (
        <CardElement
          id="card-element"
          className={`border-input w-full min-w-0 rounded-md border px-3 py-[12px] text-base shadow-xs duration-300 ${ready ? 'opacity-100 height-fit' : 'opacity-0 height-0'}`}
          onReady={() => setReady(true)}
          onChange={(event) => {
            if (event.error) setErrorMessage(event.error.message)
            else setErrorMessage(null)
            // Track whether the user has fully completed the card form
            setCardComplete(event.complete)
          }}
        />
      )}

      {!hasPaymentMethod && errorMessage && (
        <p className="text-red-400 text-sm mt-2 p-2 px-4 bg-red-100 rounded-md border-red-400 border-[1px]">
          {errorMessage}
        </p>
      )}

      {!hasPaymentMethod && (
        <div className="flex items-center space-x-2 mt-6">
          <Checkbox
            checked={savePaymentMethod}
            onCheckedChange={(checked) => setSavePaymentMethod(checked === true)}
            name="future-use"
            id="future-use"
          />
          <label htmlFor="future-use" className="text-sm leading-none">
            Save this payment method for future use
          </label>
        </div>
      )}

      {!hasPaymentMethod && savePaymentMethod && (
        <div className="mt-6 flex space-x-2">
          <Checkbox name="auto-recharge" id="auto-recharge" />
          <label htmlFor="auto-recharge" className="text-sm flex flex-col gap-1">
            Enable Auto recharge
            <span className="text-muted-foreground">
              Automatically adds $5 every time your balance falls below 25 cents.
            </span>
          </label>
        </div>
      )}

      {/* Shows saved payment method */}
      {hasPaymentMethod && (
        <div
          key={paymentMethods[0].id}
          className="flex items-center justify-between space-x-2 rounded-md border p-4"
        >
          <div className="flex items-center space-x-4">
            <Label htmlFor={`card-${paymentMethods[0].id}`} className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div className="grid gap-0.5">
                <span className="font-medium">
                  {paymentMethods[0].cardBrand.toUpperCase()} •••• {paymentMethods[0].lastFour}
                </span>
                <span className="text-xs text-muted-foreground">
                  Expires {paymentMethods[0].expiryMonth}/{paymentMethods[0].expiryYear}
                </span>
              </div>
            </Label>
          </div>
        </div>
      )}

      {/* 
       <div className="h-[1px] bg-border my-6" />
      <p className="text-sm text-muted-foreground">
        By clicking "Purchase", you agree to our{' '}
        <a
          href="https://www.termsfeed.com/live/8a1b9c0e-3f6a-4f7d-a0b5-8e2d5c6f4f9b"
          target="_blank"
          rel="noreferrer"
          className="underline text-blue-500 hover:text-blue-600"
        >
          Terms of Service
        </a>
        .
      </p> */}

      {hasPaymentMethod ? (
        <Button
          type="submit"
          className="mt-6"
          disabled={!elements || !stripe || loading || !isValidAmount(amountInput)}
        >
          {loading ? <LoaderCircle className="w-5 h-5 mr-2 animate-spin" /> : 'Purchase'}
        </Button>
      ) : (
        <Button
          disabled={
            !ready ||
            loading ||
            !stripe ||
            !elements ||
            !isValidAmount(amountInput) ||
            !cardComplete
          }
          type="submit"
          className="mt-6"
        >
          {loading ? <LoaderCircle className="w-5 h-5 mr-2 animate-spin" /> : 'Purchase'}
        </Button>
      )}
    </form>
  )
}

function isValidAmount(amount: string): boolean {
  const amountNumber = parseFloat(amount)
  return !isNaN(amountNumber) && amountNumber >= 1 && amountNumber <= 100
}
