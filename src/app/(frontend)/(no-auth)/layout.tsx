import '@/styles/globals.css'
import Link from 'next/link'
import Script from 'next/script'

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

        <p className="text-sm text-gray-500 block text-center">
          Simple Contact Form is a{' '}
          <a className="hover:underline" target="_empty" href="https://www.numbersoffice.com">
            Numbers Office LLC
          </a>{' '}
          service
        </p>
      </footer>
    </>
  )
}
