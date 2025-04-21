import type { CollectionConfig, PayloadRequest, Where } from 'payload'
import { VerifiationTokenField } from './custom-fields/verification-token'

export const Invites: CollectionConfig = {
  slug: 'invites',
  lockDocuments: false,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: async ({ req, data }) => await owner_bool({ req, data }),
    read: ownerMemberInvitee_query,
    update: owner_query,
    delete: ownerInvitee_query,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
    },
    {
      name: 'team-name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Owner',
          value: 'owner',
        },
        {
          label: 'Member',
          value: 'member',
        },
      ],
    },
    VerifiationTokenField,
  ],
  hooks: {
    afterOperation: [
      // Send an email to the invitee
      async ({ operation, req, result }) => {
        if (operation === 'create') {
          const { payload } = req
          const email = result.email
          const docId = result.id
          const teamName = result.team.name

          // Verification url
          const url =
            process.env.NEXT_PUBLIC_HOST_URL +
            '/api/invites/' +
            docId +
            '/init?email=' +
            encodeURIComponent(email)

          // Send verification email
          await payload.sendEmail({
            to: email,
            subject: `You have been invited to join ${teamName}`,
            html: `<p>Click <a href="${url}">here</a> to log in with ${email} and join the <strong>${teamName}</strong> team.</p>`,
            text: `Copy the following url into your browser to log in with ${email} and join the team ${teamName}: ${url}`,
          })
        }
      },
    ],
  },
  endpoints: [
    {
      path: '/:id/resend',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        const docId = req.routeParams?.id

        if (!docId) return Response.json('No docId provided.', { status: 400 })

        // Get invite
        const inviteRes = await req.payload.findByID({
          collection: 'invites',
          id: docId as string,
        })

        if (!inviteRes) return Response.json('Invite not found.', { status: 404 })

        // Get invite data
        const { email, team } = inviteRes

        // Check if team is valid
        if (typeof team !== 'object') return Response.json('Invalid team.', { status: 400 })

        // Verification url
        const url =
          process.env.NEXT_PUBLIC_HOST_URL +
          '/api/invites/' +
          docId +
          '/init?email=' +
          encodeURIComponent(email)

        // Send verification email
        await req.payload.sendEmail({
          to: email,
          subject: `You have been invited to join ${team.name}`,
          html: `<p>Click <a href="${url}">here</a> to log in with ${email} and join the <strong>${team.name}</strong> team.</p>`,
          text: `Copy the following url into your browser to log in with ${email} and join the team ${team.name}: ${url}`,
        })

        return Response.json('Verification email resent.')
      },
    },
    // Initialize the payload invitation flow
    {
      path: '/:id/init',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const email = req.query.email

        // Send user to auth if they don't have a session
        if (!req.user) {
          // Check if user has an account
          const userRes = await req.payload.find({
            collection: 'app-users',
            where: {
              email: { equals: email },
            },
          })

          // If user has an account, send them to login
          // Otherwise send them to create an account
          if (userRes.docs.length > 0) {
            return Response.redirect(`${process.env.NEXT_PUBLIC_HOST_URL}/login?email=${email}`)
          } else {
            return Response.redirect(`${process.env.NEXT_PUBLIC_HOST_URL}/register?email=${email}`)
          }
        }

        return Response.json('Recipient verification failed.')
      },
    },
    // Accept the invite
    {
      path: '/:id/accept',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        const docId = req.routeParams?.id
        const user = req.user

        if (!docId) return Response.json('No docId provided.', { status: 400 })
        if (!user) return Response.json('No user provided.', { status: 400 })

        // Get invite
        const inviteRes = await req.payload.findByID({
          collection: 'invites',
          id: docId as string,
        })

        if (!inviteRes) return Response.json('Invite not found.', { status: 404 })

        // Get invite data
        const { email, team, role } = inviteRes

        // Check if user is the invitee
        if (user.email !== email) return Response.json('You are not the invitee.', { status: 401 })

        // Check if team is valid
        if (typeof team !== 'object') return Response.json('Invalid team.', { status: 400 })

        // Create member or owner document
        const data = { owners: team.owners, members: team.members }
        if (role === 'owner') {
          if (data.owners) data.owners?.push(user)
          else data.owners = [user]
        } else {
          if (data.members) data.members?.push(user)
          else data.members = [user]
        }

        // Create team member
        const teamRes = await req.payload.update({
          collection: 'teams',
          id: team.id,
          data: data,
        })

        // Check if team was created
        if (!teamRes) return Response.json('Team not found.', { status: 404 })

        // Delete invite
        await req.payload.delete({
          collection: 'invites',
          where: {
            id: { equals: docId },
          },
        })

        return Response.json({ message: 'Invite accepted', doc: { id: teamRes.id } })
      },
    },
  ],
}

/////////////////////////////////////////////////////////////////////////
// Access control
/////////////////////////////////////////////////////////////////////////
async function owner_bool({ req, data }: { req: PayloadRequest; data: any }) {
  const { user } = req

  // Prevent unauthenticated access
  // Allow unrestricted admin access
  if (!user) return false
  if (user.collection === 'users') return true

  // Skip if data is not provided
  if (!data) return false

  // Get team
  const teamRes = await req.payload.findByID({
    collection: 'teams',
    id: data.team,
  })

  // Check if team exists
  if (!teamRes) return false
  if (typeof teamRes !== 'object') return false

  // Check if user is owner
  const isOwner = teamRes.owners?.some((owner: any) => {
    return owner.id === user.id
  })
  if (!isOwner) return false

  return true
}

function owner_query({ req }: { req: PayloadRequest }) {
  const { user } = req

  // Prevent unauthenticated access
  // Allow unrestricted admin access
  if (!user) return false
  if (user.collection === 'users') return true

  return {
    'team.owners': {
      contains: user,
    },
  } as Where
}

function ownerMemberInvitee_query({ req }: { req: PayloadRequest }) {
  const { user } = req

  // Prevent unauthenticated access
  // Allow unrestricted admin access
  if (!user) return false
  if (user.collection === 'users') return true

  return {
    or: [
      {
        email: { equals: user.email },
      },
      {
        'team.members': {
          contains: user,
        },
      },
      {
        'team.owners': {
          contains: user,
        },
      },
    ],
  } as Where
}

function ownerInvitee_query({ req }: { req: PayloadRequest }) {
  const { user } = req

  // Prevent unauthenticated access
  // Allow unrestricted admin access
  if (!user) return false
  if (user.collection === 'users') return true

  return {
    or: [
      {
        email: { equals: user.email },
      },
      {
        'team.owners': {
          contains: user,
        },
      },
    ],
  } as Where
}
