import type { Access, PayloadRequest, Where } from 'payload'

// A create operation needs a boolean: a query constraint is not evaluated against input data.
export const createForAssociates: Access = async ({ req, data }) => {
  if (adminsOnly({ req })) return true
  if (!req.user || typeof data?.team !== 'string') return false
  return canAccessTeam(req, data.team)
}

export const updateForAssociates: Access = async ({ req, data }) => {
  if (adminsOnly({ req })) return true
  if (!req.user) return false
  if (data?.team !== undefined) {
    if (typeof data.team !== 'string' || !(await canAccessTeam(req, data.team))) return false
  }
  return associatesOnly({ req })
}

async function canAccessTeam(req: PayloadRequest, id: string) {
  const team = await req.payload.findByID({
    collection: 'teams',
    id,
    depth: 0,
    overrideAccess: false,
    disableErrors: true,
    req,
  })
  return Boolean(team)
}

/**
 * Enforces the following access rules:
 * - Users must be authenticated
 * - Users must be an admin OR a owner/member of the associated team
 *
 * @param req - The request object
 * @returns
 */
export function associatesOnly({ req }: { req: PayloadRequest }) {
  const { user } = req

  // Allow unrestricted access for admins
  if (user?.collection === 'users') return true

  // Only allow authenticated access
  if (!user) return false

  // Only return true if the user is a member or owner of the team
  return {
    or: [
      {
        'team.members': {
          contains: user.id,
        },
      },
      {
        'team.owners': {
          contains: user.id,
        },
      },
    ],
  } as Where
}

/**
 * Enforces the following access rules:
 * - Users must be authenticated
 * - Users must be an admin OR a owner of the associated team
 *
 * @param req - The request object
 * @returns
 */
export function ownersOnly({ req }: { req: PayloadRequest }) {
  const { user } = req

  // Allow unrestricted access for admins
  if (user?.collection === 'users') return true

  // Only allow authenticated access
  if (!user) return false

  // Only return true if the user is a member or owner of the team
  return {
    'team.owners': {
      contains: user.id,
    },
  } as Where
}

/**
 * Allows only admin users or local API to access the collection
 * @param req - The request object
 */
export function adminsOnly({ req }: { req: PayloadRequest }) {
  const { user } = req

  // Allow unrestricted access for admins
  if (user?.collection === 'users') return true

  return false
}
