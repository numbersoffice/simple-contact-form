import type { CollectionConfig, PayloadRequest, Where } from 'payload'

export const Teams: CollectionConfig = {
  slug: 'teams',
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
      name: 'members',
      type: 'relationship',
      relationTo: 'app-users',
      hasMany: true,
    },
    {
      name: 'owners',
      type: 'relationship',
      relationTo: 'app-users',
      hasMany: true,
    },
    {
      name: 'forms',
      type: 'join',
      collection: 'forms',
      on: 'team',
    },
    {
      name: 'openaiKey',
      type: 'text',
      access: { read: () => false },
      hooks: {
        afterRead: [({ value, context }) => context.includeLLMKey === true ? value : null],
      },
      admin: {
        description:
          'LLM API key for spam filtering. An OpenAI key, or an Anthropic key (starting with sk-ant-) to use Claude.',
      },
    },
  ],
  access: {
    create: ({ req: { user }, data }) => {
      // Allow admin access
      if (user?.collection === 'users') return true

      // Make sure users can not add owners arbitrarily
      if (data?.owners)
        throw new Error('You can not add owners to a team. This is done automatically.')

      return true
    },
    read: isOwnerOrMember,
    update: isOwner,
    delete: isOwner,
  },
  hooks: {
    beforeChange: [
      //Automatically add creating user as owner
      ({ req: { user }, data }) => {
        if (user?.collection === 'app-users') {
          return {
            ...data,
            owners: [user.id],
          }
        }
        return data
      },
    ],
    beforeDelete: [
      // Remove all forms
      async ({ req, id }) => {
        // Delete forms
        await req.payload.delete({
          collection: 'forms',
          where: {
            team: {
              equals: id,
            },
          },
        })

        // Delete recipients
        await req.payload.delete({
          collection: 'recipients',
          where: {
            team: {
              equals: id,
            },
          },
        })
      },
    ],
  },
  endpoints: [
    // Remove a team member
    {
      path: '/:id/members/:memberId',
      method: 'delete',
      handler: async (req: PayloadRequest) => {
        // Check if user is authenticated
        if (req.user?.collection !== 'app-users') {
          return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        // Get query params
        // Make sure they exist
        const teamId = req.routeParams?.id as string | undefined
        const memberId = req.routeParams?.memberId as string | undefined

        if (!teamId || !memberId) {
          return Response.json({ message: 'Team or member ID not provided' }, { status: 404 })
        }

        // Get team data
        // Check if team exists
        const teamRes = await req.payload.findByID({
          collection: 'teams',
          id: teamId,
          depth: 0,
          disableErrors: true,
        })

        if (!teamRes) {
          return Response.json({ message: 'Team not found' }, { status: 404 })
        }

        // Check if initiating user is member or owner
        const initiatingUser = req.user
        const members = (teamRes.members || []).map((member) => typeof member === 'string' ? member : member.id)
        const owners = (teamRes.owners || []).map((owner) => typeof owner === 'string' ? owner : owner.id)
        const initiatingUserIsMember = members.includes(initiatingUser.id)
        const initiatingUserIsOwner = owners.includes(initiatingUser.id)

        // Check if user to be removed is member
        const userToBeRemovedIsOwner = owners.includes(memberId)

        // Check user permission to remove member
        // User is not part of the team
        if (!initiatingUserIsMember && !initiatingUserIsOwner) {
          console.log('User is not a member or owner')
          return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        // User is last owner
        if (owners.length === 1 && userToBeRemovedIsOwner) {
          console.log('User is last owner')
          return Response.json({ message: 'You cannot remove the last owner' }, { status: 401 })
        }

        // User is member and not trying to remove themselves
        if (!initiatingUserIsOwner && initiatingUser.id !== memberId) {
          console.log('User is a member trying to remove themselves')
          return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        // User is allowed to remove member
        // Construct new data with filtered members and owners
        const data = {
          members: members.filter((id) => id !== memberId),
          owners: owners.filter((id) => id !== memberId),
        }

        // Update team
        const teamUpdateRes = await req.payload.update({
          collection: 'teams',
          where: {
            and: [{ id: { equals: teamId } }, { updatedAt: { equals: teamRes.updatedAt } }],
          },
          data,
        })

        // Check for update success
        if (!teamUpdateRes.docs.length) {
          return Response.json({ message: 'Team changed. Please retry.' }, { status: 409 })
        }

        return Response.json({ message: 'Member removed' }, { status: 200 })
      },
    },
  ],
}

function isOwner({ req }: { req: PayloadRequest }) {
  const user = req.user

  // Allow unrestricted access for admins
  if (user?.collection === 'users') return true

  // Only allow authenticated access
  if (!user) return false

  // Only allow owners to delete the team
  return {
    or: [
      {
        owners: {
          contains: user,
        },
      },
    ],
  } as Where
}

async function isOwnerOrMember({ req }: { req: PayloadRequest }) {
  const user = req.user

  // Allow unrestricted access for admins
  if (user?.collection === 'users') return true

  // Only allow authenticated access
  if (!user) return false

  // Only return teams that the user is a member or owner of
  return {
    or: [
      {
        members: {
          contains: user,
        },
      },
      {
        owners: {
          contains: user,
        },
      },
    ],
  } as Where
}
