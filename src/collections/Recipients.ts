import type { CollectionConfig, PayloadRequest } from 'payload'
import { associatesOnly } from './utils/access'
import { VerifiationTokenField } from './custom-fields/verification-token'
import { Recipient } from '@/payload-types'

export const Recipients: CollectionConfig = {
  slug: 'recipients',
  lockDocuments: false,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'verified',
      type: 'checkbox',
      required: true,
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
    },
    VerifiationTokenField,
  ],
  access: {
    create: ({ req, data }) => {
      // Check for authorization
      if (!associatesOnly({ req })) return false

      // Prevent users from setting the verified field to true
      // Local api is exempt from this check since it skips access checks
      if (data?.verified) return false

      return true
    },
    read: associatesOnly,
    update: ({ req, data }) => {
      // Chec for authorization
      if (!associatesOnly({ req })) return false

      // Prevent users from setting the verified field to true
      // Local api is exempt from this check since it skips access checks
      if (data?.verified) return false

      return true
    },
    delete: associatesOnly,
  },
  hooks: {
    afterOperation: [
      // Send an email to verify the recipient
      async ({ operation, req, result }) => {
        if (operation === 'create') {
          const { payload, user } = req
          const email = result.email
          const docId = result.id
          const { verificationToken } = await req.payload.findByID({
            collection: 'recipients',
            id: docId,
          })

          // Skip if user is trying to add their own email
          if (user?.email === email) {
            // Set the recipient to verified
            await payload.update({
              collection: 'recipients',
              data: {
                verified: true,
              },
              where: {
                id: { equals: docId },
              },
            })
            return
          }

          // Verification url
          const url =
            process.env.NEXT_PUBLIC_HOST_URL +
            '/api/recipients/' +
            docId +
            '/verify?token=' +
            verificationToken

          // Send verification email
          await payload.sendEmail({
            to: email,
            subject: 'Verify recipient email',
            html: `<p>Click <a href="${url}">here</a> to finish adding ${email} as a recipient email to Simple Contact Form.</p>`,
            text: `Copy the following url into your browser to finish adding ${email} as a recipient email to Simple Contact Form: ${url}`,
          })
        }
      },
    ],
    beforeDelete: [
      // Remove recipient from all forms when being deleted
      async ({ id, req }) => {
        // Get all forms with this recipient
        const forms = await req.payload.find({
          collection: 'forms',
          where: {
            recipients: {
              contains: id,
            },
          },
        })

        // Update each form to remove the recipient
        forms.docs.forEach((form) => {
          const recipients = form.recipients ? form.recipients : []
          const updatedRecipients = recipients.filter((r) => {
            // Return true for strings to not cause unintended side effects down the road
            // Removing old data should be an explicit function
            if (typeof r !== 'object') return true
            if (r.id !== id) return true
            return false
          })

          req.payload.update({
            collection: 'forms',
            id: form.id,
            data: {
              ...form,
              recipients: updatedRecipients,
            },
          })
        })
      },
    ],
  },
  endpoints: [
    // Verify invite
    {
      path: '/:id/verify',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const docId = req.routeParams?.id
        const token = req.query.token

        if (docId && token) {
          // Check if the recipient is already verified
          const recipient = await req.payload.findByID({
            collection: 'recipients',
            id: docId.toString(),
          })

          if (recipient?.verified) {
            return Response.json('Recipient has already been verified.')
          }

          // Check if the token is valid
          if (recipient?.verificationToken !== token) {
            return Response.json('Invalid token.')
          }

          // Update the recipient to verified
          await req.payload.update({
            collection: 'recipients',
            data: {
              verified: true,
            },
            where: {
              id: { equals: docId },
            },
          })

          return Response.json('Successfully verified recipient email.')
        }

        return Response.json('Recipient verification failed.')
      },
    },
    // Resend verification
    {
      path: '/:id/resend',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        try {
          // Check for required parameters
          const docId = req.routeParams?.id as string
          if (!docId) throw new Error('Missing parameter: id')

          // Make sure user is authenticated and authorized
          const user = req.user
          if (!user || user.collection !== 'app-users') throw new Error('Team not found.')

          // Get doc data
          const doc = await req.payload.findByID({
            collection: 'recipients',
            id: docId,
          })

          // Check if user is team owner or member
          if (typeof doc.team !== 'object') throw new Error('Couldn not find team')
          if (typeof doc.team.owners !== 'object' && typeof doc.team.owners !== 'object')
            throw new Error('User not part of team')

          const isOwner =
            doc.team.owners?.some((el) => {
              if (typeof el === 'object') {
                if (el.id === user.id) return true
              }
            }) || false

          const isMember =
            doc.team.members?.some((el) => {
              if (typeof el === 'object') {
                if (el.id === user.id) return true
              }
            }) || false

          if (!isOwner && !isMember) throw new Error('User not part of team')

          // Verification url
          const url =
            process.env.NEXT_PUBLIC_HOST_URL +
            '/api/recipients/' +
            docId +
            '/verify?token=' +
            doc.verificationToken

          // Send verification email
          await req.payload.sendEmail({
            to: doc.email,
            subject: 'Verify recipient email',
            html: `<p>Click <a href="${url}">here</a> to finish adding ${doc.email} as a recipient email to Simple Contact Form.</p>`,
            text: `Copy the following url into your browser to finish adding ${doc.email} as a recipient email to Simple Contact Form: ${url}`,
          })
        } catch (err) {
          Response.json(err, { status: 500 })
        }

        return Response.json('Successfully verified recipient email.')
      },
    },
  ],
}
