import { describe, expect, it } from 'vitest'
import type { Access, AccessArgs } from 'payload'
import { Users } from '../../collections/Users'
import { AppUsers } from '../../collections/AppUsers'

const args = (collection?: string): AccessArgs => ({
  req: { user: collection ? { id: 'alice', collection } : null },
}) as AccessArgs

describe('account access boundaries', () => {
  it.each(['create', 'read', 'update', 'delete', 'unlock'] as const)(
    'restricts administrator %s access to administrators',
    async (operation) => {
      const access = Users.access![operation] as Access
      expect(await access(args())).toBe(false)
      expect(await access(args('app-users'))).toBe(false)
      expect(await access(args('users'))).toBe(true)
    },
  )

  it.each(['read', 'update'] as const)('scopes application account %s to self', async (operation) => {
    const access = AppUsers.access![operation] as Access
    expect(await access(args())).toBe(false)
    expect(await access(args('app-users'))).toEqual({ id: { equals: 'alice' } })
    expect(await access(args('users'))).toBe(true)
  })

  it.each(['create', 'delete', 'unlock'] as const)('restricts application account %s', async (operation) => {
    expect(await (AppUsers.access![operation] as Access)(args('app-users'))).toBe(false)
  })
})
