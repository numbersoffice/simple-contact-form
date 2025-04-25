import payload from '@/lib/payload'

// Stripe endpoint to receive charge webhooks and update the teams balance accordingly
export async function POST(request: Request) {
  try {
    const payloadData = await request.json()
    const amount = payloadData.data.object.amount
    const autoRecharge = payloadData.data.object.metadata.autoRecharge
    const teamId = payloadData.data.object.metadata.team
    const futureUse = payloadData.data.object.metadata.futureUse

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
    }

    return new Response('Webhook received', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Webhook error', { status: 500 })
  }
}
