import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar({
  withLogo = true,
  withAuthButtons = false,
}: {
  withLogo?: boolean
  withAuthButtons?: boolean
}) {
  return (
    <nav className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-between py-6 px-6 w-full mx-auto h-[73px]">
      <div className="flex items-center space-x-2">
        {withLogo && (
          <Link href="/" className="flex items-center space-x-2">
            <Image
              width={50}
              height={70}
              alt="Simple Contact Form Logo"
              src="/images/scf_logo.png"
            />
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {/* <Link href="/roadmap" className="text-sm text-gray-700 hover:underline">
          Roadmap
        </Link> */}
        {withAuthButtons && (
          <>
            <Link href="/login" className="text-sm text-gray-700 hover:underline">
              Login
            </Link>
            <Link href="/register">
              <Button size="sm">
                Get started <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
