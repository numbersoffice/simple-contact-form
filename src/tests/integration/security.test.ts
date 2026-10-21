import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { randomUUID } from 'node:crypto'
import { buildConfig, getPayload, type Payload } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { Users } from '../../collections/Users'
import { AppUsers } from '../../collections/AppUsers'
import { Teams } from '../../collections/Teams'
import { Recipients } from '../../collections/Recipients'
import { Forms } from '../../collections/Forms'
import { Invites } from '../../collections/Invites'
import type { AppUser, Team } from '../../payload-types'

// Always use a uniquely named local test database, never the application's DATABASE_URI.
const database = `scf_security_test_${randomUUID().replaceAll('-', '')}`
const sendEmail = vi.fn().mockResolvedValue({})
let payload: Payload
let alice: AppUser & { collection: 'app-users' }
let bob: AppUser & { collection: 'app-users' }
let eve: AppUser & { collection: 'app-users' }
let team: Team

beforeAll(async () => {
  payload = await getPayload({
    config: buildConfig({
      secret: randomUUID(),
      admin: { user: 'users' },
      collections: [Users, AppUsers, Teams, Recipients, Forms, Invites],
      db: mongooseAdapter({
        url: `mongodb://127.0.0.1:27018/${database}?replicaSet=rs0&directConnection=true`,
        ensureIndexes: true,
      }),
      email: () => ({ name: 'test', defaultFromAddress: 'test@example.com', defaultFromName: 'Test', sendEmail }),
      typescript: { autoGenerate: false },
    }),
  })
  const createUser = async (name: string) => ({
    ...await payload.create({
      collection: 'app-users', disableVerificationEmail: true,
      data: { email: `${name}@example.com`, password: 'test-password-12345!', _verified: true },
    }),
    collection: 'app-users' as const,
  })
  alice = await createUser('alice')
  bob = await createUser('bob')
  eve = await createUser('eve')
  team = await payload.create({
    collection: 'teams', data: { name: 'Alice and Bob', owners: [alice.id, bob.id], openaiKey: 'test-secret-key' },
  })
})

afterAll(async () => {
  if (payload) {
    await payload.db.connection.dropDatabase()
    await payload.destroy()
  }
})

describe('security boundaries against MongoDB', () => {
  it('denies administrator creation and cross-account password changes by app users', async () => {
    await expect(payload.create({
      collection: 'users', user: eve, overrideAccess: false,
      data: { email: 'admin@example.com', password: 'test-password-12345!' },
    })).rejects.toThrow()
    await expect(payload.update({
      collection: 'app-users', id: alice.id, user: eve, overrideAccess: false,
      data: { password: 'attacker-password-12345!' },
    })).rejects.toThrow()
    const result = await payload.find({ collection: 'app-users', user: eve, overrideAccess: false })
    expect(result.docs.map((doc) => doc.id)).toEqual([eve.id])
  })

  it('allows authenticated team creation and preserves multiple owners on updates', async () => {
    const created = await payload.create({
      collection: 'teams', user: eve, overrideAccess: false, depth: 0, data: { name: 'Eve' },
    })
    expect(created.owners).toEqual([eve.id])
    const updated = await payload.update({
      collection: 'teams', id: team.id, user: alice, overrideAccess: false, depth: 0,
      data: { name: 'Renamed' },
    })
    expect(updated.owners).toEqual([alice.id, bob.id])
  })

  it('prevents cross-team recipient creation, modification, and token control', async () => {
    await expect(payload.create({
      collection: 'recipients', user: eve, overrideAccess: false,
      data: { team: team.id, email: 'target@example.com', verified: false },
    })).rejects.toThrow()
    const recipient = await payload.create({
      collection: 'recipients', user: alice, overrideAccess: false,
      data: { team: team.id, email: 'target@example.com', verified: false, verificationToken: 'chosen' },
    })
    expect(recipient.verificationToken).toBeUndefined()
    await expect(payload.update({
      collection: 'recipients', id: recipient.id, user: eve, overrideAccess: false,
      data: { email: 'stolen@example.com' },
    })).rejects.toThrow()
    const before = await payload.findByID({ collection: 'recipients', id: recipient.id })
    expect(before.verificationToken).not.toBe('chosen')
    await payload.update({
      collection: 'recipients', id: recipient.id, user: alice, overrideAccess: false,
      data: { verificationToken: 'chosen-again' },
    })
    const after = await payload.findByID({ collection: 'recipients', id: recipient.id })
    expect(after.verificationToken).toBe(before.verificationToken)
  })

  it('invalidates verification and sends a fresh confirmation after email changes', async () => {
    const recipient = await payload.create({
      collection: 'recipients', data: { team: team.id, email: 'old@example.com', verified: true },
    })
    const before = await payload.findByID({ collection: 'recipients', id: recipient.id })
    sendEmail.mockClear()
    await payload.update({
      collection: 'recipients', id: recipient.id, user: alice, overrideAccess: false,
      data: { email: 'new@example.com' },
    })
    const after = await payload.findByID({ collection: 'recipients', id: recipient.id })
    expect(after.verified).toBe(false)
    expect(after.verificationToken).not.toBe(before.verificationToken)
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'new@example.com' }))
  })

  it('keeps keys out of ordinary reads but supplies them to the trusted submission read', async () => {
    const ordinary = await payload.findByID({ collection: 'teams', id: team.id, user: alice, overrideAccess: false })
    expect(JSON.stringify(ordinary)).not.toContain('test-secret-key')
    const explicit = await payload.findByID({
      collection: 'teams', id: team.id, user: alice, overrideAccess: false, showHiddenFields: true,
    })
    expect(JSON.stringify(explicit)).not.toContain('test-secret-key')
    const local = await payload.findByID({ collection: 'teams', id: team.id })
    expect(JSON.stringify(local)).not.toContain('test-secret-key')
    const form = await payload.create({ collection: 'forms', data: { name: 'Contact', team: team.id } })
    const trusted = await payload.findByID({ collection: 'forms', id: form.id, showHiddenFields: true })
    expect(typeof trusted.team === 'object' && trusted.team.openaiKey).toBe('test-secret-key')
  })

  it('returns all records when pagination is explicitly disabled', async () => {
    for (let index = 0; index < 12; index++) {
      await payload.create({ collection: 'forms', data: { name: `Form ${index}`, team: team.id } })
    }
    const result = await payload.find({
      collection: 'forms', user: alice, overrideAccess: false, pagination: false,
      where: { team: { equals: team.id } },
    })
    expect(result.docs.length).toBeGreaterThan(10)
    expect(result.hasNextPage).toBe(false)
  })
})
