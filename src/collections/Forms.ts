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
          async ({ value }) => {
            if (!value) {
              return generateId()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'spamFilterEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Enable AI-powered spam filtering for this form',
      },
    },
    {
      name: 'spamFilterPrompt',
      type: 'textarea',
      admin: {
        description: 'Describe the purpose of your form to help the AI identify spam',
      },
      defaultValue:
        'This is a general contact form. Filter out spam, promotional content, automated submissions, and messages that are not genuine contact attempts from real people seeking to communicate.',
    },
  ],
  access: {
    create: associatesOnly,
    read: associatesOnly,
    update: associatesOnly,
    delete: ownersOnly,
  },
}
