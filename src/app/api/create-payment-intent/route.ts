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

    const futureUse = data.futureUse ? 'true' : 'false'

    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        team: data.team,
        user: data.user,
        futureUse,
        // Make sure auto recharge is only set to true if future use is also true
        autoRecharge: data.autoRecharge && futureUse ? 'true' : 'false',
        address: data.address ? JSON.stringify(data.address) : null,
      },
      payment_method_types: ['card'],
      setup_future_usage: data.futureUse ? 'off_session' : undefined,
    })

    console.log(`${data.email}: Created payment intent.`)

    return NextResponse.json({ clientSecret: paymentIntent.client_secret }, { status: 200 })
  } catch (error) {
    console.log('Error:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
}
