import { describe, expect, it } from 'vitest'
import { Teams } from '../../collections/Teams'

describe('team ownership hooks', () => {
  it('assigns the creator only during creation', async () => {
    const hook = Teams.hooks!.beforeChange![0]
    const req = { user: { id: 'alice', collection: 'app-users' } }
    expect(await hook({ req, operation: 'create', data: { name: 'Team' } } as never))
      .toEqual({ name: 'Team', owners: ['alice'] })
    const data = { name: 'Renamed', owners: ['alice', 'bob'] }
    expect(await hook({ req, operation: 'update', data } as never)).toEqual(data)
    expect(await hook({ req, operation: 'update', data: { name: 'Renamed' } } as never))
      .toEqual({ name: 'Renamed' })
  })
})
