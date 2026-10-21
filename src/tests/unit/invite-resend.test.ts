import { describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import { Invites } from '../../collections/Invites'

const endpoint = Array.isArray(Invites.endpoints) ? Invites.endpoints.find((endpoint) => endpoint.path === '/:id/resend')! : undefined

describe('invite resends', () => {
  it.each([
    [null, 401],
    [{ id: 'outsider', collection: 'app-users' }, 403],
    [{ id: 'member', collection: 'app-users' }, 403],
    [{ id: 'owner', collection: 'app-users' }, 200],
    [{ id: 'admin', collection: 'users' }, 200],
  ])('authorizes the requester %j', async (user, status) => {
    const sendEmail = vi.fn()
    const req = {
      user, routeParams: { id: 'invite' },
      payload: {
        findByID: vi.fn().mockResolvedValue({ email: 'invitee@example.com', team: { name: 'Team', owners: ['owner'], members: ['member'] } }),
        sendEmail,
      },
    } as unknown as PayloadRequest
    expect((await endpoint!.handler(req)).status).toBe(status)
    expect(sendEmail).toHaveBeenCalledTimes(status === 200 ? 1 : 0)
  })
})
