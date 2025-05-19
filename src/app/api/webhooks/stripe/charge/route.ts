import payload from '@/lib/payload'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
})

// Stripe endpoint to receive charge webhooks and update the teams balance accordingly
export async function POST(request: Request) {
  try {
    const payloadData = await request.json()
    const amount = payloadData.data.object.amount
    const autoRecharge = payloadData.data.object.metadata.autoRecharge
    const teamId = payloadData.data.object.metadata.team
    const futureUse = payloadData.data.object.metadata.futureUse
    const metadata = payloadData.data.object.metadata

    // Check if the webhook is for a successful charge
    if (payloadData.type === 'charge.succeeded') {
      // Get current balance
      const { balance, autoRecharge: autoRechargeExisting } = await payload.findByID({
        collection: 'teams',
        id: teamId,
      })

      // Update the team's balance
      await payload.update({
        collection: 'teams',
        id: teamId,
        data: {
          balance: balance !== undefined || balance !== null ? balance + amount : 0,
          autoRecharge:
            autoRechargeExisting || (futureUse && autoRecharge === 'true') ? true : false,
        },
      })

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

    return new Response('Webhook received', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Webhook error', { status: 500 })
  }
}
