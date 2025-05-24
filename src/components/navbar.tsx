import Image from 'next/image'
import Link from 'next/link'

export default function Navbar({ withLogo = true }: { withLogo?: boolean }) {
  return (
    <nav className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-between py-6 px-6 w-full max-w-[1200px] mx-auto h-[73px]">
      <div className="flex items-center space-x-2">
        {withLogo && (
          <Link href="/" className="flex items-center space-x-2">
            {/* <Inbox size={28} /> */}
            {/* <h1 className="text-2xl font-semibold">SCF</h1> */}
            <Image
              width={50}
              height={70}
              alt="Simple Contact Form Logo"
              src="/images/scf_logo.png"
            />
          </Link>
        )}
        {/* <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`h-[16px] w-[16px] rounded ${true ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
              </TooltipTrigger>
              <TooltipContent>
                  <p>System Status - Online</p>
                </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/roadmap" className="text-sm text-gray-700 hover:underline">
          Roadmap
        </Link>
      </div>
    </nav>
  )
}
