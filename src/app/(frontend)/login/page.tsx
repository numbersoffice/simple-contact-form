'use client'

import SubmitButton from '@/components/button-submit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const router = useRouter()
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

    try {
      // Submit the form data using the fetch API.
      // Note: When using FormData, content type is automatically set
      const response = await fetch('/api/login', {
        method: 'POST',
        body: formData,
      })

      // Check if the response status indicates success
      if (!response.ok) {
        // Log error messages if response is not ok
        const data = await response.json()
        setError(data.error)
        setLoading(false)
        return
      }

      // Parse the JSON response from the server
      const data = await response.json()

      // Redirect to the forms page on successful registration
      router.push(data.redirect)
    } catch (error) {
      // Catch any network or unexpected errors
      console.error('Fetch error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {email && (
            <Card className="bg-blue-500 text-white">
              <CardHeader>
                <CardTitle className="text-2xl">New invite</CardTitle>
                <CardDescription className="text-white">
                  Create an account using <strong>{email}</strong> to accept or decline your team
                  invite.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
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
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input name="password" type="password" required />
                    {error?.password && (
                      <Label htmlFor="password" className="text-red-400 font-normal">
                        {error.password.join(', ')}
                      </Label>
                    )}
                  </div>
                  <SubmitButton loading={loading} className="mt-4 w-full">
                    Login
                  </SubmitButton>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="underline underline-offset-4">
                    Sign up
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
