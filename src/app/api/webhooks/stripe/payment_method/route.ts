import payload from '@/lib/payload'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
})

// Stripe endpoint to receive charge webhooks and update the teams balance accordingly
export async function POST(request: Request) {
  try {
    const payloadData = await request.json()
    const teamId = payloadData.data.object.metadata.team

    // Payment method was attached successfully
    if (payloadData.type === 'payment_method.attached') {
      // Check if the team already has a payment method
      const existingPaymentMethod = await payload.find({
        collection: 'payment-methods',
        where: {
          team: {
            equals: teamId,
          },
        },
        limit: 1,
      })
      if (existingPaymentMethod.docs.length > 0) {
        // Update the existing payment method
        await payload.update({
          collection: 'payment-methods',
          id: existingPaymentMethod.docs[0].id,
          data: {
            stripePaymentMethodId: payloadData.data.object.id,
            stripeCustomerId: payloadData.data.object.customer,
            stripeFingerprint: payloadData.data.object.card.fingerprint,
            status: 'active',
            owner: payloadData.data.object.metadata.user,
            cardBrand: payloadData.data.object.card.brand,
            lastFour: payloadData.data.object.card.last4,
            expiryMonth: payloadData.data.object.card.exp_month,
            expiryYear: payloadData.data.object.card.exp_year,
          },
        })

        // Detach the old payment method from user in stripe
        const stripePaymentMethodId = existingPaymentMethod.docs[0].stripePaymentMethodId
        if (stripePaymentMethodId) {
          stripe.paymentMethods.detach(stripePaymentMethodId)
        }
      } else {
        await payload.create({
          collection: 'payment-methods',
          data: {
            team: teamId,
            stripePaymentMethodId: payloadData.data.object.id,
            stripeCustomerId: payloadData.data.object.customer,
            stripeFingerprint: payloadData.data.object.card.fingerprint,
            status: 'active',
            owner: payloadData.data.object.metadata.user,
            cardBrand: payloadData.data.object.card.brand,
            lastFour: payloadData.data.object.card.last4,
            expiryMonth: payloadData.data.object.card.exp_month,
            expiryYear: payloadData.data.object.card.exp_year,
          },
        })
      }
    }

    if (payloadData.type === 'payment_method.detached') {
      // Remove the payment method from db
      await payload.delete({
        collection: 'payment-methods',
        where: {
          stripePaymentMethodId: {
            equals: payloadData.data.object.id,
          },
        },
      })
    }

    return new Response('Webhook received', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Webhook error', { status: 500 })
  }
}
