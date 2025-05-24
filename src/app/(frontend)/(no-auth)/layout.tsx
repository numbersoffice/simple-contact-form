import '@/styles/globals.css'

import Image from 'next/image'
import Link from 'next/link'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}

      <footer className="border-t p-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link className="text-sm text-center text-gray-500 hover:underline" href="/terms">
            Terms & Conditions
          </Link>
          <Link className="text-sm text-center text-gray-500 hover:underline" href="/privacy">
            Privacy Policy
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-2 justify-center items-center  w-full">
          <Image
            width={40}
            height={40}
            alt="Fotura Logo"
            src="/images/fotura_logo.jpg"
            className="h-5 w-5 flex-shrink-0"
          />
          <p className="text-sm text-gray-500 block text-center">
            Simple Contact Form is a Fotura, Inc. service
          </p>
        </div>
      </footer>
    </>
  )
}
