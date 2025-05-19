import payload from '@/lib/payload'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
})

// Stripe endpoint to receive charge webhooks and update the teams balance accordingly
export async function POST(request: Request) {
  try {
    const payloadData = await request.json()
    const metadata = payloadData.data.object.metadata

    // Payment method was attached successfully
    if (payloadData.type === 'payment_method.attached') {
      // Check if the team already has a payment method
      const existingPaymentMethod = await payload.find({
        collection: 'payment-methods',
        where: {
          team: {
            equals: payloadData.data.object.metadata.team,
          },
        },
        limit: 1,
      })

      // Check if the payment method already exists
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
            team: payloadData.data.object.metadata.team,
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

      // Check if customer has a billing address in stripe
      const customer = await stripe.customers.retrieve(payloadData.data.object.customer, {
        expand: ['default_source'],
      })

      // Parse address from payload
      const newAddress = metadata.address && JSON.parse(metadata.address)

      if (newAddress) {
        await stripe.customers
          .update(customer.id, {
            name: newAddress.value.name,
            address: {
              city: newAddress.value.address.city,
              country: newAddress.value.address.country,
              line1: newAddress.value.address.line1,
              line2: newAddress.value.address.line2,
              postal_code: newAddress.value.address.postal_code,
              state: newAddress.value.address.state,
            },
          })
          .catch((error) => {
            console.error('Error updating customer address:', error)
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
