import type { CollectionConfig } from 'payload'

export const AppUsers: CollectionConfig = {
  slug: 'app-users',
  lockDocuments: false,
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    verify: {
      generateEmailHTML: ({ token, user }) => {
        const verificationUrl = `${process.env.NEXT_PUBLIC_HOST_URL}/api/email-verification?token=${token}&email=${user.email}`
        return `Hey ${user.email}, verify your email by clicking here: ${verificationUrl}`
      },
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'default-team',
      type: 'relationship',
      relationTo: 'teams',
    },
    {
      name: 'owned-teams',
      type: 'join',
      collection: 'teams',
      on: 'owners',
    },
    {
      name: 'member-teams',
      type: 'join',
      collection: 'teams',
      on: 'members',
    }
  ],
}
