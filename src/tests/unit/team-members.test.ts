import { describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import { Teams } from '../../collections/Teams'

const endpoint = Array.isArray(Teams.endpoints) ? Teams.endpoints.find((endpoint) => endpoint.method === 'delete')! : undefined

async function remove(userId: string, memberId: string, owners = ['owner']) {
  const update = vi.fn().mockResolvedValue({ docs: [{ id: 'team' }] })
  const req = {
    user: { id: userId, collection: 'app-users' },
    routeParams: { id: 'team', memberId },
    payload: {
      findByID: vi.fn().mockResolvedValue({ id: 'team', owners, members: ['member'], updatedAt: 'now' }),
      update,
    },
  } as unknown as PayloadRequest
  const response = await endpoint!.handler(req)
  return { response, update }
}

describe('team member removal', () => {
  it('rejects an outsider', async () => {
    const { response, update } = await remove('outsider', 'owner')
    expect(response.status).toBe(401)
    expect(update).not.toHaveBeenCalled()
  })

  it('protects the last owner and prevents members removing others', async () => {
    expect((await remove('owner', 'owner')).response.status).toBe(401)
    expect((await remove('member', 'owner', ['owner', 'other'])).response.status).toBe(401)
  })

  it('allows members to leave and owners to remove members', async () => {
    expect((await remove('member', 'member')).response.status).toBe(200)
    const { response, update } = await remove('owner', 'member')
    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: { owners: ['owner'], members: [] } }))
  })
})
