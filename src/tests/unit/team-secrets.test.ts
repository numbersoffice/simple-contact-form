import { describe, expect, it } from 'vitest'
import type { TextField } from 'payload'
import { Teams } from '../../collections/Teams'

const field = Teams.fields.find((field) => 'name' in field && field.name === 'openaiKey') as TextField

describe('team secrets', () => {
  it('denies ordinary API reads', async () => {
    expect(await field.access!.read!({} as never)).toBe(false)
  })

  it('hides secrets from default local reads', () => {
    expect(field.hidden).toBe(true)
  })
})
