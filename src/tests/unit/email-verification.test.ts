import { beforeEach, describe, expect, it, vi } from 'vitest'
const { verifyEmail } = vi.hoisted(() => ({ verifyEmail: vi.fn() }))
vi.mock('@/lib/payload', () => ({ default: { verifyEmail } }))
import { GET } from '../../app/api/email-verification/route'

describe('account email verification responses', () => {
  beforeEach(() => { verifyEmail.mockReset() })
  const request = () => new Request('http://localhost/api/email-verification?token=abc&email=alice%2Btest%40example.com')

  it('preserves missing-parameter errors', async () => {
    expect((await GET(new Request('http://localhost/api/email-verification'))).status).toBe(400)
    expect(verifyEmail).not.toHaveBeenCalled()
  })

  it('redirects successful verification to login', async () => {
    verifyEmail.mockResolvedValue(true)
    expect((await GET(request())).headers.get('location')).toBe('http://localhost/login')
    expect(verifyEmail).toHaveBeenCalledWith({ collection: 'app-users', token: 'abc' })
  })

  it.each(['invalid', 'exception'])('preserves verification failures: %s', async (result) => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    if (result === 'exception') verifyEmail.mockRejectedValue(new Error('internal detail'))
    else verifyEmail.mockResolvedValue(false)
    const location = new URL((await GET(request())).headers.get('location')!)
    expect(location.pathname).toBe('/verification-failure')
    expect(location.searchParams.get('email')).toBe('alice+test@example.com')
    expect(location.searchParams.get('error')).not.toContain('internal detail')
    log.mockRestore()
  })
})
