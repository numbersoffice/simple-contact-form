import { describe, expect, it, vi } from 'vitest'
import type { AccessArgs } from 'payload'
import { associatesOnly, createForAssociates, updateForAssociates } from '../../collections/utils/access'
import { Recipients } from '../../collections/Recipients'

function request(team: object | null) {
  return {
    user: { id: 'alice', collection: 'app-users' },
    payload: { findByID: vi.fn().mockResolvedValue(team) },
  } as unknown as AccessArgs['req']
}

describe('team-scoped writes', () => {
  it('retains the existing-document team constraint on recipient updates', async () => {
    const req = request(null)
    expect(await Recipients.access!.update!({ req, data: { email: 'new@example.com' } }))
      .toEqual(associatesOnly({ req }))
  })

  it('rejects creation and transfer into an inaccessible team', async () => {
    const req = request(null)
    expect(await createForAssociates({ req, data: { team: 'other' } })).toBe(false)
    expect(await updateForAssociates({ req, data: { team: 'other' } })).toBe(false)
    expect(req.payload.findByID).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: false, req }))
  })

  it('allows creation in an accessible team and scopes transfers to existing documents', async () => {
    const req = request({ id: 'ours' })
    expect(await createForAssociates({ req, data: { team: 'ours' } })).toBe(true)
    expect(await updateForAssociates({ req, data: { team: 'ours' } })).toEqual(associatesOnly({ req }))
  })
})
