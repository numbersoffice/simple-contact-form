import { describe, expect, it } from 'vitest'
import type { TextField } from 'payload'
import { Teams } from '../../collections/Teams'

const field = Teams.fields.find((field) => 'name' in field && field.name === 'openaiKey') as TextField

describe('team secrets', () => {
  it('denies ordinary API reads', async () => {
    expect(await field.access!.read!({} as never)).toBe(false)
  })

  it('redacts secrets even in privileged local reads unless explicitly requested', async () => {
    const hook = field.hooks!.afterRead![0]
    expect(await hook({ value: 'secret', context: {} } as never)).toBeNull()
    expect(await hook({ value: 'secret', context: { includeLLMKey: true } } as never)).toBe('secret')
  })
})
