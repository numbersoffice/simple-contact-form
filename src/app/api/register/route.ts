import { SignupFormSchema } from '@/lib/definitions'
import payload from '@/lib/payload'

export async function POST(request: Request) {
  try {
    // Parse the Form Data from the request
    const formData = await request.formData()
    const formObject = Object.fromEntries(formData.entries())

    // Validate the request body using the SignupFormSchema from Zod
    const parsedData = SignupFormSchema.safeParse(formObject)
    if (!parsedData.success) {
      // Flatten and return the validation errors with a 400 status code
      return Response.json({ error: parsedData.error.flatten().fieldErrors }, { status: 400 })
    }

    // Destructure validated email and password from the parsed data
    const { email, password } = parsedData.data

    // Create a new user with the validated email and password
    await payload.create({
      collection: 'app-users',
      data: { email, password },
    })

    return Response.json({ redirect: '/verification', email: email }, { status: 200 })
  } catch (error) {
    // Log error details for debugging and return a generic error message
    console.error('Error during account creation:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
