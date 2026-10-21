import type { CollectionConfig } from 'payload'
import { adminsOnly } from './utils/access'

export const Users: CollectionConfig = {
  slug: 'users',
  lockDocuments: false,
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    admin: adminsOnly,
    create: adminsOnly,
    read: adminsOnly,
    update: adminsOnly,
    delete: adminsOnly,
    unlock: adminsOnly,
  },
  fields: [],
}
