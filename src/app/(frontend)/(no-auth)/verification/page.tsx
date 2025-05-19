import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import payload from '@/lib/payload'
import { redirect } from 'next/navigation'

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { email } = await searchParams

  // Redirect to login if no email is provided in the url (likely an accidental visit)
  if (!email) return redirect('/login')

  // Check if user exists and is verified
  const res = await payload.find({
    collection: 'app-users',
    where: {
      email: {
        equals: email,
      },
    },
  })

  // If user is not found, redirect to login
  if (res.docs.length === 0) return redirect('/login')

  // If user is found and verified, redirect to login
  if (res.docs[0]._verified) return redirect('/login')

  // If user is found but NOT verified, load page
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Email verification</CardTitle>
              <CardDescription>
                Please verify your account by clicking the link we sent to{' '}
                <span className="font-bold text-black">{email}</span>.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
