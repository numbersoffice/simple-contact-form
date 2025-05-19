'use client'

import { useAppData } from '@/context/app-data'
import { AppUser } from '@/payload-types'
import { CardElement, useElements, useStripe, AddressElement } from '@stripe/react-stripe-js'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'

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
  const [addressComplete, setAddressComplete] = useState(false)

  const [addAddress, setAddAddress] = useState(false)

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

    // Retrieve address info from Stripe Elements
    const addressElement = elements.getElement(AddressElement)
    const addressData = addressElement && (await addressElement.getValue())

    // Get payment intent client secret
    const setupIntentRes = await fetch('/api/create-setup-intent', {
      method: 'POST',
      body: JSON.stringify({
        user: user.id,
        email: user.email,
      }),
    })
    const { clientSecret, error } = await setupIntentRes.json()

    if (!clientSecret || error) {
      toast.error('Payment could not be set up. Please try again.')
      setLoading(false)
      return
    }

    // Retrieve card info from Stripe Elements
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast.error('Could not retrieve card info. Please try again.')
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
          email: user.email,
          team: activeTeam.id,
          address: addressData ? JSON.stringify(addressData) : null,
        },
      },
    })

    if (stripeError) {
      setLoading(false)
      setErrorMessage(stripeError.message || 'An unknown error occurred.')
      toast.error('Payment processing error. Please try again.')
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
        className="mb-3 border-input w-full min-w-0 rounded-md border px-3 py-[12px] text-base shadow-xs duration-300"
        onReady={() => setReady(true)}
        options={{
          disableLink: true,
        }}
        onChange={(event) => {
          if (event.error) setErrorMessage(event.error.message)
          else setErrorMessage(null)
          // Track whether the user has fully completed the card form
          setCardComplete(event.complete)
        }}
      />

      {errorMessage && (
        <p className="text-red-400 text-sm mb-2 p-2 px-4 bg-red-100 rounded-md border-red-400 border-[1px]">
          {errorMessage}
        </p>
      )}

      <div className="flex items-center space-x-2 mt-2">
        <Checkbox
          checked={addAddress}
          onCheckedChange={(checked) => setAddAddress(checked === true)}
          name="billing-address"
          id="billing-address"
        />
        <label htmlFor="billing-address" className="text-sm leading-none">
          Add billing address for receipts
        </label>
      </div>

      <div className={`mt-4 ${addAddress ? 'opacity-100 h-auto pb-4 pt-2' : 'opacity-0 h-0'}`}>
        {/* <Label htmlFor="address-element" className="mb-4 mt-4">
          Address
        </Label> */}
        <AddressElement
          id="address-element"
          options={{ mode: 'billing', autocomplete: { mode: 'disabled' } }}
          onChange={(event) => {
            // Track whether the user has fully completed the address form
            setAddressComplete(event.complete)
          }}
        />
      </div>

      <Button
        disabled={
          // Check if statusis loading
          loading ||
          // Check if stripe and elements are loaded
          !ready ||
          !stripe ||
          !elements ||
          // Check if card is complete
          !cardComplete ||
          // If address is required, check if it's complete
          (addAddress && !addressComplete)
        }
        type="submit"
        className="mt-2"
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
