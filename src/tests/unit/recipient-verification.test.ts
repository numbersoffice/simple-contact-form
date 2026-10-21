import { describe, expect, it } from 'vitest'
import type { CollectionBeforeChangeHook } from 'payload'
import { Recipients } from '../../collections/Recipients'
import { VerifiationTokenField } from '../../collections/custom-fields/verification-token'

describe('recipient verification', () => {
  it('invalidates verification and rotates the token when the address changes', async () => {
    const hook = Recipients.hooks!.beforeChange![0]
    const result = await hook({
      operation: 'update', originalDoc: { email: 'old@example.com' },
      data: { email: 'new@example.com', verified: true, verificationToken: 'chosen' },
    } as unknown as Parameters<CollectionBeforeChangeHook>[0])
    expect(result.verified).toBe(false)
    expect(result.verificationToken).toMatch(/^[a-f0-9]{64}$/)
    expect(result.verificationToken).not.toBe('chosen')
  })

  it('denies token reads and writes by app users and anonymous callers', async () => {
    if (!('access' in VerifiationTokenField)) throw new Error('Missing field access')
    for (const user of [null, { id: 'alice', collection: 'app-users' }]) {
      for (const operation of ['create', 'read', 'update'] as const) {
        const access = VerifiationTokenField.access![operation]!
        expect(await access({ req: { user } } as Parameters<typeof access>[0])).toBe(false)
      }
    }
  })
})
