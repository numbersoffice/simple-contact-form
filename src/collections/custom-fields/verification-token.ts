import type { Field } from 'payload'
import { randomBytes } from 'node:crypto'
import { adminsOnly } from '../utils/access'

export const generateVerificationToken = () => randomBytes(32).toString('hex')

/**
 * This field adds a verificaitonToken field to the collection.
 * - It is generated when the document is created.
 * - It is not exposed to the app users.
 */
export const VerifiationTokenField: Field = {
  name: 'verificationToken',
  type: 'text',
  access: {
    create: adminsOnly,
    read: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    readOnly: true,
  },
  hooks: {
    beforeChange: [
      // Generate a verification token before creating the document
      ({ value, operation }) => {
        if (operation === 'create') {
          return generateVerificationToken()
        }
        return value
      },
    ],
  },
}
