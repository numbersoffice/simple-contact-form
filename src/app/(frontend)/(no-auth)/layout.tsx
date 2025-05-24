import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import '@/styles/globals.css'
import { Inbox } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-between py-6 px-6 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Inbox size={28} />
            <h1 className="text-2xl font-semibold">SCF</h1>
          </Link>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`h-[16px] w-[16px] rounded ${true ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
              </TooltipTrigger>
              {/* <TooltipContent>
                  <p>System Status - Online</p>
                </TooltipContent> */}
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/roadmap" className="text-sm text-gray-700 hover:underline">
            Roadmap
          </Link>
        </div>
      </nav>

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
