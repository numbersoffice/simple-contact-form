import type { CollectionConfig } from 'payload'
import { associatesOnly, ownersOnly } from './utils/access'

export const Forms: CollectionConfig = {
  slug: 'forms',
  lockDocuments: false,
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
    },
    {
      name: 'recipients',
      type: 'relationship',
      relationTo: 'recipients',
      hasMany: true,
    },
  ],
  access: {
    create: associatesOnly,
    read: associatesOnly,
    update: associatesOnly,
    delete: ownersOnly,
  },
}
