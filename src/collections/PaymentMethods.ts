import type { CollectionConfig } from 'payload'
import { adminsOnly, ownersOnly } from './utils/access'
import stripe from '@/lib/stripe'

export const PaymentMethods: CollectionConfig = {
  slug: 'payment-methods',
  lockDocuments: false,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'cardBrand',
          type: 'text',
          required: true,
        },
        {
          name: 'lastFour',
          label: 'Last 4 digits',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'expiryMonth',
          label: 'Expiry month',
          type: 'number',
          required: true,
        },
        {
          name: 'expiryYear',
          label: 'Expiry year',
          type: 'number',
          required: true,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
      ],
      required: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'app-users',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'stripePaymentMethodId',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'stripeCustomerId',
          type: 'text',
          required: true,
        },
        {
          name: 'stripeFingerprint',
          type: 'text',
          required: true,
        },
      ],
    },

    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
    },
  ],
  access: {
    create: adminsOnly,
    read: ownersOnly,
    update: adminsOnly,
    delete: adminsOnly,
  },
  hooks: {
    beforeDelete: [
      // Remove payment method from Stripe
      async ({ req, id }) => {
        // Get payment method
        const paymentMethod = await req.payload.findByID({
          collection: 'payment-methods',
          id,
        })

        // Make sure payment method is an object
        if (typeof paymentMethod === 'object') {
          // Detach payment method from Stripe
          await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId).catch((err) => {
            if (err.statusCode !== 400) {
              console.error(err)
            }
          })

          // Make sure team is an object
          if (typeof paymentMethod.team === 'object') {
            // Turn off auto-recharge
            await req.payload.update({
              collection: 'teams',
              id: paymentMethod.team.id,
              data: {
                autoRecharge: false,
              },
            })
          }
        }
      },
    ],
  },
}
