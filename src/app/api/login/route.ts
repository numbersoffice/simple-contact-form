import payload from '@/lib/payload'
import { cookies } from 'next/headers'
import { LoginFormSchema } from '@/lib/definitions'

export async function POST(request: Request) {
  // Await the cookie store
  const cookieStore = await cookies()

  try {
    // Parse the Form Data from the request
    const formData = await request.formData()
    const formObject = Object.fromEntries(formData.entries())

    // Validate the request body using the SignupFormSchema from Zod
    const parsedData = LoginFormSchema.safeParse(formObject)
    if (!parsedData.success) {
      console.log(parsedData.error)
      // Flatten and return the validation errors with a 400 status code
      return Response.json({ error: parsedData.error.flatten().fieldErrors }, { status: 400 })
    }

    // Destructure validated email and password from the parsed data
    const { email, password } = parsedData.data

    // Attempt to log in with the validated credentials
    const result = await payload.login({
      collection: 'app-users',
      data: { email, password },
    })

    // Return a 401 status code for unauthorized access
    if (!result.token) return Response.json({ error: 'Invalid email or password' }, { status: 401 })

    // If a token is returned, set the cookie with secure options
    cookieStore.set({
      name: 'payload-token',
      value: result.token,
      httpOnly: true,
    })

    // Get users teams
    const teams = await payload.find({
      collection: 'teams',
      user: result.user,
      overrideAccess: false,
      disableErrors: true,
    })

    let defaultTeamId =
      typeof result.user['default-team'] !== 'string'
        ? result.user['default-team']?.id || null
        : null

    if (teams.docs.length === 0) {
      // If the user has no teams, create a personal team
      const team = await payload.create({
        collection: 'teams',
        data: {
          name: 'Personal',
          owners: [result.user.id],
        },
      })
      // Update user's default team
      await payload.update({
        collection: 'app-users',
        id: result.user.id,
        data: {
          'default-team': team.id,
        },
      })

      defaultTeamId = team.id
    } else if (defaultTeamId === null) {
      // If the user has teams but no default team, set the first team as default
      defaultTeamId = teams.docs[0].id

      await payload.update({
        collection: 'app-users',
        id: result.user.id,
        data: {
          'default-team': defaultTeamId,
        },
      })
    }

    return Response.json(
      { message: 'Success', redirect: `/${defaultTeamId}/forms` },
      { status: 200 },
    )
  } catch (error) {
    // Log error details for debugging and return a generic error message
    console.error('Error during login:', error)
    return Response.json(
      {
        error: {
          password: ['Invalid email or password'],
        },
      },
      { status: 500 },
    )
  }
}
