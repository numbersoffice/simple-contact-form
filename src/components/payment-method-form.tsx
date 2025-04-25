'use client'

import { useAppData } from '@/context/app-data'
import { AppUser } from '@/payload-types'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Label } from './ui/label'

export default function PaymentMethodForm({
  user,
  onSuccess,
  isUpdate = false,
}: {
  user: AppUser
  onSuccess: () => void
  isUpdate?: boolean
}) {
  const router = useRouter()
  const { activeTeam } = useAppData()

  const stripe = useStripe()
  const elements = useElements()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)

  /**
   * Handle adding or replacing payment method
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

    // Get payment intent client secret
    const setupIntentRes = await fetch('/api/create-setup-intent', {
      method: 'POST',
      body: JSON.stringify({
        user: user.id,
        email: user.email,
        team: activeTeam.id,
      }),
    })
    const { clientSecret, error } = await setupIntentRes.json()

    if (!clientSecret || error) {
      toast.error('There has been an issue adding your payment method. Please try again.')
      setLoading(false)
      return
    }

    // Retrieve card info from Stripe Elements
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast.error('There has been an issue adding your payment method. Please try again.')
      setLoading(false)
      return
    }

    // Confirm the setup intent with the card element
    const { error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          email: user.email,
        },
        metadata: {
          user: user.id,
          team: activeTeam.id,
        },
      },
    })

    if (stripeError) {
      setLoading(false)
      setErrorMessage(stripeError.message || 'An unknown error occurred.')
      toast.error('There has been an issue adding your payment method. Please try again.')
      return
    }

    // Success
    // Wait for webhook to come through, then close dialog and refresh page
    setTimeout(() => {
      router.refresh()
      setLoading(false)
      toast.success(isUpdate ? 'Payment method replaced!' : 'Payment method added!')
      onSuccess()
    }, 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col relative">
      <Label htmlFor="card-element" className="mb-2 mt-4">
        Card information
      </Label>
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

      {errorMessage && (
        <p className="text-red-400 text-sm mt-2 p-2 px-4 bg-red-100 rounded-md border-red-400 border-[1px]">
          {errorMessage}
        </p>
      )}

      <Button
        disabled={!ready || loading || !stripe || !elements || !cardComplete}
        type="submit"
        className="mt-6"
      >
        {loading ? (
          <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
        ) : isUpdate ? (
          'Replace Payment Method'
        ) : (
          'Add Payment Method'
        )}
      </Button>
    </form>
  )
}
