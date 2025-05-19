'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { createContext, useContext, useState } from 'react'

const SetupIntentContext = createContext<unknown | undefined>(undefined)

// Custom hook to access the setup intent context
export function useSetupIntent() {
  const context = useContext(SetupIntentContext)
  if (!context) {
    throw new Error('useSetupIntent must be used within a StripeElementsProvider')
  }
  return context
}

export default function StripeElementsProvider({ children }: { children: React.ReactNode }) {
  const [stripePromise] = useState(loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!))

  return <Elements stripe={stripePromise}>{children}</Elements>
}
