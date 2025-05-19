import React from 'react'
import './styles.css'
import '@/styles/globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  // description: 'A blank template using Payload in a Next.js app.',
  title: 'Simple Contact Form',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
