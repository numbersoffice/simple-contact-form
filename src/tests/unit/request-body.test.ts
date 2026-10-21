import { describe, expect, it, vi } from 'vitest'
import { PayloadTooLargeError, readLimitedFormData } from '../../functions/submit/read-form-data'

describe('bounded form parsing', () => {
  it('cancels a streamed upload once its actual byte count exceeds the limit', async () => {
    const cancel = vi.fn()
    const body = new ReadableStream({
      pull(controller) { controller.enqueue(new Uint8Array(10)) },
      cancel,
    })
    await expect(readLimitedFormData({ body } as Request, 15)).rejects.toBeInstanceOf(PayloadTooLargeError)
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('accepts a body exactly at the byte limit', async () => {
    const request = new Request('http://localhost', {
      method: 'POST', body: 'a=b', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    })
    expect((await readLimitedFormData(request, 3)).get('a')).toBe('b')
  })
})
