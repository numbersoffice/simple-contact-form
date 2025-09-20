import type { CollectionConfig } from 'payload'
import { associatesOnly, ownersOnly } from './utils/access'
import { generateId } from '@/lib/utils'

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
    {
      name: 'formId',
      type: 'text',
      unique: true,
      hooks: {
        beforeValidate: [
          // Auto generate formId if not provided
          async ({ value, field }) => {
            console.log(field)
            if (!value) {
              return generateId()
            }
            return value
          },
        ],
      },
    },

    // {
    //   name: 'id',
    //   type: 'text',
    //   unique: true,
    //   required: true,
    //   hooks: {
    //     beforeValidate: [
    //       // Auto generate ID if not provided
    //       async ({ value }) => {
    //         console.log(value)
    //         if (!value) {
    //           return generateId()
    //         }
    //         return value
    //       },
    //     ],
    //   },
    // },
  ],
  access: {
    create: associatesOnly,
    read: () => true, //associatesOnly,
    update: associatesOnly,
    delete: ownersOnly,
  },
}
