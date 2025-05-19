'use client'

import SubmitButton from '@/components/button-submit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const formRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Record<'email' | 'password', string[]>>()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Check if the form element exists
    if (!formRef.current) return

    setLoading(true)

    // Create FormData from the form element.
    const formData = new FormData(formRef.current)
    const email = formData.get('email')

    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST_URL}/api/app-users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    })

    // Check if the response status indicates success
    if (!res.ok) {
      // Log error messages if response is not ok
      const data = await res.json()
      setError(data.error)
      setLoading(false)
      return
    }

    setLoading(false)
    toast.success('Check your email for the reset password link')
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reset password</CardTitle>
              <CardDescription>
                Enter your email address and we will send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input name="email" type="email" placeholder="m@example.com" required />
                    {error?.email && (
                      <Label htmlFor="email" className="text-red-400 font-normal">
                        {error.email.join(', ')}
                      </Label>
                    )}
                  </div>
                  <SubmitButton loading={loading} className="mt-4 w-full">
                    Send reset link
                  </SubmitButton>
                </div>
                <div className="mt-4 text-center text-sm">
                  <Link href="/login" className="underline underline-offset-4">
                    Back to login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
