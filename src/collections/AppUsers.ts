import type { Access, CollectionConfig } from 'payload'
import { adminsOnly } from './utils/access'

const selfOrAdmin: Access = ({ req }) => {
  if (adminsOnly({ req })) return true
  if (req.user?.collection !== 'app-users') return false
  return { id: { equals: req.user.id } }
}

export const AppUsers: CollectionConfig = {
  slug: 'app-users',
  lockDocuments: false,
  access: {
    admin: adminsOnly,
    create: adminsOnly,
    read: selfOrAdmin,
    update: selfOrAdmin,
    delete: adminsOnly,
    unlock: adminsOnly,
  },
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
