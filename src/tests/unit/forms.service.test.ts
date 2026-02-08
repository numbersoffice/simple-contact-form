import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { handleFormSubmission } from '../../functions/submit'

const makeReq = (body: Record<string, string>, headers: Record<string, string> = {}) => {
  const fd = new FormData()
  Object.entries(body).forEach(([k, v]) => fd.append(k, v))
  return new NextRequest('http://localhost/api/forms/abc', {
    method: 'POST',
    body: fd,
    headers: new Headers({ ...headers }),
  })
}

const baseDeps = () => ({
  payload: {
    find: vi.fn(),
    sendEmail: vi.fn(),
  },
  consumeBalance: vi.fn(),
  checkforSpam: vi.fn(),
  utils: {
    checkQueryParams: (p: Record<string, unknown>, req: string[]) => ({ success: !!p.form_id }),
    customResponse: (status: number, body: { message: string; success: boolean }) =>
      new Response(JSON.stringify(body), { status }),
    extractFormData: (fd: FormData) =>
      Array.from(fd.entries()).map(([name, value]) => ({ name, value: String(value) })),
    successResponse: (_wantsJson: boolean, _returnUrl: string, message: string) =>
      new Response(JSON.stringify({ ok: true, message }), { status: 200 }),
    withCORS: (res: Response) => res,
  },
  config: {
    HONEYPOTS: ['are_you_human'],
    MAX_FIELDS: 100,
    MAX_FIELD_LEN: 3000,
    MAX_BYTES: 500_000,
  },
})

describe('handleFormSubmission', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects payload too large from Content-Length', async () => {
    const deps = baseDeps()
    const req = makeReq({ a: 'b' }, { 'content-length': String(600_000) })
    const res = await handleFormSubmission(req, { form_id: 'abc' }, deps as any)
    expect(res.status).toBe(413)
  })

  it('honeypot short-circuits but returns success-ish', async () => {
    const deps = baseDeps()
    const req = makeReq({ name: 'x', are_you_human: 'yes' })
    const res = await handleFormSubmission(req, { form_id: 'abc' }, deps as any)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toBeDefined()
  })

  it('spam returns generic success without sending', async () => {
    const deps = baseDeps()
    deps.checkforSpam.mockResolvedValue(true)
    const req = makeReq({ name: 'x' })
    const res = await handleFormSubmission(req, { form_id: 'abc' }, deps as any)
    expect(res.status).toBe(200)
    expect(deps.payload.sendEmail).not.toHaveBeenCalled()
  })

  it('missing form returns 400', async () => {
    const deps = baseDeps()
    deps.checkforSpam.mockResolvedValue(false)
    deps.payload.find.mockResolvedValue(null)
    const req = makeReq({ name: 'x' })
    const res = await handleFormSubmission(req, { form_id: 'missing' }, deps as any)
    expect(res.status).toBe(400)
  })

  it('success path charges and sends emails', async () => {
    const deps = baseDeps()
    deps.checkforSpam.mockResolvedValue(false)
    deps.payload.find.mockResolvedValue({
      docs: [{ name: 'My Form', recipients: [{ email: 'to@example.com' }], team: { id: 't1' } }],
    })
    deps.consumeBalance.mockResolvedValue({})
    const req = makeReq({ name: 'John', message: 'Hi' })
    const res = await handleFormSubmission(req, { form_id: 'abc' }, deps as any)
    expect(res.status).toBe(200)
    expect(deps.consumeBalance).toHaveBeenCalledWith({ team: { id: 't1' }, charge: 1 })
    expect(deps.payload.sendEmail).toHaveBeenCalledTimes(1)
  })
})
