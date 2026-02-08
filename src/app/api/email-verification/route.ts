import payload from '@/lib/payload'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  let email = ''
  let token = ''

  try {
    // Get query parameter "token" from the request
    const tokenArray = request.url
      .split('?')[1] // Get the query string
      .split('&') // Split into individual parameters

    const tempToken = tokenArray.find((param) => param.startsWith('token'))?.split('=')[1] // Get the token value
    const tempEmail = tokenArray.find((param) => param.startsWith('email'))?.split('=')[1] // Get the email value

    if (!tempToken || !tempEmail) {
      return Response.json({ error: 'Invalid token' }, { status: 400 })
    }

    email = tempEmail
    token = tempToken

    const isVerified = await payload.verifyEmail({
      collection: 'app-users',
      token,
    })

    if (!isVerified) {
      return redirect(
        `/verification-failure?email=${email}&error=${JSON.stringify(
          'Email verification failed. Token might be expired or invalid.',
        )}`,
      )
    }

  } catch (error) {
    // Log error details for debugging and return a generic error message
    console.error('Error during email verification:', error)
    return redirect(`/verification-failure?email=${email}&error=${JSON.stringify(error)}`) // Redirect to a failure page with error details
  } finally {
    return redirect('/login')
  }
}
