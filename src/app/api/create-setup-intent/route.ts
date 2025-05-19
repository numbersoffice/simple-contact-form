import payload from '@/lib/payload'
import { NextResponse, NextRequest } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Get stripe customer ID
    const { stripeCustomerId } = await payload.findByID({
      collection: 'app-users',
      id: data.user,
    })

    if (!stripeCustomerId) {
      console.log(`${data.email}: Customer ID not found.`)
      return NextResponse.json({ error: 'Customer ID not found' }, { status: 400 })
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
    })

    if (!setupIntent.client_secret) {
      console.log(`${data.email}: Failed to create setup intent`)
      return NextResponse.json({ error: 'Failed to create setup intent' }, { status: 500 })
    }

    console.log(`${data.email}: Created setup intent.`)

    return NextResponse.json({ clientSecret: setupIntent.client_secret }, { status: 200 })
  } catch (error) {
    console.log('Error:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
}
