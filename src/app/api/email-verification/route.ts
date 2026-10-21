import payload from '@/lib/payload'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const email = url.searchParams.get('email')
  const token = url.searchParams.get('token')

  if (!email || !token) {
    return Response.json({ error: 'Invalid token' }, { status: 400 })
  }

  const failureUrl = new URL('/verification-failure', url)
  failureUrl.searchParams.set('email', email)
  failureUrl.searchParams.set('error', 'Email verification failed. Token might be expired or invalid.')

  try {
    const isVerified = await payload.verifyEmail({
      collection: 'app-users',
      token,
    })

    if (!isVerified) {
      return Response.redirect(failureUrl, 303)
    }
    return Response.redirect(new URL('/login', url), 303)
  } catch (error) {
    // Log error details for debugging and return a generic error message
    console.error('Error during email verification:', error)
    return Response.redirect(failureUrl, 303)
  }
}
