import { Field } from 'payload'

/**
 * This field adds a verificaitonToken field to the collection.
 * - It is generated when the document is created.
 * - It is not exposed to the app users.
 */
export const VerifiationTokenField: Field = {
  name: 'verificationToken',
  type: 'text',
  admin: {
    readOnly: true,
  },
  hooks: {
    beforeChange: [
      // Generate a verification token before creating the document
      ({ value, operation }) => {
        if (operation === 'create') {
          // Generate a random token
          const token =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)
          return token
        }
        return value
      },
    ],
    afterRead: [
      // Hide token from app users
      ({ value, req }) => {
        // Expose token to local API
        // Access controll is already handled in access settings
        if (!req.user) return value

        // Expose token to admins
        if (req.user?.collection === 'users') return value

        // Hide token from app users
        if (req.user && req.user?.collection === 'app-users') return null
      },
    ],
  },
}
