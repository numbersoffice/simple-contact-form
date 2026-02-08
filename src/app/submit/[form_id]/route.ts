import { NextRequest, NextResponse } from 'next/server'
import payload from '@/lib/payload'
import checkforSpam from '@/functions/spam'
import {
  checkQueryParams,
  customResponse,
  extractFormData,
  successResponse,
} from '@/functions/request'
import { handleFormSubmission } from '@/functions/submit'
import type { ServiceDeps } from '../../../functions/submit/types'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
const withCORS = (res: Response) => {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
  return res
}
export function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ form_id: string }> },
) {
  const awaitedParams = await params
  const deps: ServiceDeps = {
    payload,
    checkforSpam,
    utils: { checkQueryParams, customResponse, extractFormData, successResponse, withCORS },
    config: {
      HONEYPOTS: ['are_you_human'],
      MAX_FIELDS: 100,
      MAX_FIELD_LEN: 3000,
      MAX_BYTES: 500_000,
    },
  }
  return handleFormSubmission(request, awaitedParams, deps)
}
