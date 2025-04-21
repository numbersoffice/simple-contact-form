import { Form, Team } from '@/payload-types'
import payload from '@/lib/payload'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
})

/**
 * Charges the team
 * Handles reload, recharge, and insufficient funds
 * Emails team owners if balance is insufficient
 * @param team - Payload team object
 * @param charge - How much to charge (in cents)
 */
export async function consumeBalance({
  team,
  form,
  charge,
}: {
  team: Team
  form: Form
  charge: number
}) {
  // Check if team has a balance
  if (team.balance === null || team.balance === undefined) {
    return { error: 'Balance field is not set up correctly.' }
  }

  // Check if balance is sufficient
  // Balance is below 25
  if (team.balance < 25) {
    ////////////////////////
    // Autocharge is enabled
    ////////////////////////

    // Attempt to top up balance
    if (team.autoRecharge) {
      // Get Stripe customer id in preparation for charge
      const paymentMethodRes = await payload.find({
        collection: 'payment-methods',
        where: {
          team: {
            equals: team.id,
          },
        },
        limit: 1,
      })

      const customerId =
        typeof paymentMethodRes.docs[0].owner === 'object'
          ? paymentMethodRes.docs[0].owner.stripeCustomerId
          : null

      if (!customerId) {
        return { error: 'Could not retrieve owner of payment method.' }
      }

      // Charge the payment method
      try {
        await stripe.paymentIntents.create({
          amount: 500,
          currency: 'usd',
          customer: customerId,
          payment_method: paymentMethodRes.docs[0].stripePaymentMethodId,
          off_session: true,
          confirm: true,
          metadata: {
            team: team.id,
          },
        })

        // Inform team owners
        team.owners?.forEach((owner) => {
          if (typeof owner === 'object')
            payload.sendEmail({
              to: owner.email,
              subject: 'Team balance recharged',
              text: `Your ${team.name} team has been successfully recharged. Your new balance is ${team.balance ? team.balance + 500 : 500} cents.`,
            })
        })
      } catch (err) {
        // Charge failed
        // Send email to team owners
        team.owners?.forEach((owner) => {
          if (typeof owner === 'object')
            payload.sendEmail({
              to: owner.email,
              subject: 'Low credit balance',
              text: `We were unable to charge the payment method of your team ${team.name}. Please update your payment method or recharge your credit balance to avoid service interruptions.`,
            })
        })
        return { error: 'Could not charge team.' }
      }
    } else {
      ////////////////////////////
      // Autocharge is NOT enabled
      ////////////////////////////

      // Charge not possible
      if (team.balance === 0) {
        team.owners?.forEach((owner) => {
          if (typeof owner === 'object')
            payload.sendEmail({
              to: owner.email,
              subject: 'Credit balance depleted',
              text: `Your ${team.name} team ran out of credits. Recharge your team credits or turn on auto recharge to continue service.`,
            })
        })

        return { error: 'Team has no balance.' }
      }

      // Auto recharge not enabled
      // Send email to team owners
      team.owners?.forEach((owner) => {
        if (typeof owner === 'object')
          payload.sendEmail({
            to: owner.email,
            subject: 'Low credit balance',
            text: `The credit balance of your ${team.name} team is ${team.balance}. Recharge your team balance soon or turn on auto recharge to avoid service interruptions.`,
          })
      })
    }

    return { data: 'Successfully consumed team credits.' }
  }

  // Decrement team balance by one cent
  const consumeRes = await payload.update({
    collection: 'teams',
    id: team.id,
    data: {
      balance: team.balance - charge,
    },
  })

  if (!consumeRes) return { error: 'Could not consume credit.' }

  // Recharge balance if auto recharge is enabled
  if (team.balance < 26 && team.autoRecharge) {
    // TODO: Charge with stripe
  }

  return { data: 'Success' }
}
