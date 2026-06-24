import React from 'react'
import type { Metadata } from 'next'
import './styles.css'
import '@/styles/globals.css'
import { Toaster } from 'sonner'

const siteUrl = process.env.NEXT_PUBLIC_HOST_URL || 'https://simplecontactform.org'
const description =
  'Spam protected form submissions directly to your email inbox. No backend setup required.'

export const metadata: Metadata = {
  // Used to resolve the relative Open Graph / Twitter image URLs below to absolute ones.
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Simple Contact Form',
    template: '%s · Simple Contact Form',
  },
  description,
  alternates: {
    canonical: '/',
    // Discoverability hint for agents/crawlers: the machine-readable usage guide.
    types: {
      'text/plain': '/llms.txt',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Simple Contact Form',
    title: 'Simple Contact Form',
    description,
    url: siteUrl,
    locale: 'en_US',
    // The preview image is generated dynamically — see opengraph-image.tsx.
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simple Contact Form',
    description,
    // The preview image is generated dynamically — see twitter-image.tsx.
  },
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
