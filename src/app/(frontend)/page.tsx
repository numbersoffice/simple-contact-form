import React from 'react'
import { ArrowRight, Inbox } from 'lucide-react'

import './styles.css'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function HomePage() {
  return (
    <div>
      <nav className="absolute left-1/2 -translate-x-1/2 w-full flex space-x-2 px-6 items-center py-6 pb-0 max-w-[1200px] mx-auto">
        <Inbox width={28} height={28} />
        <div className="text-2xl font-semibold">SCF</div>
        <div className="h-[16px] w-[16px] rounded bg-green-500" data-state="closed"></div>
      </nav>
      <section className="min-h-screen flex flex-col items-center justify-center py-24 px-6 gap-6">
        <h1 className="text-5xl md:text-7xl max-w-[550px] text-center mx-auto font-bold">
          Simple <br />
          Contact Form
        </h1>
        <p className="text-xl text-gray-600 max-w-[550px] mx-auto text-center">
          Spam protected form submissions directly to your email inbox. No backend setup required.
          Only pay for what you use.
        </p>
        <p className="text-center w-fit text-xl mx-auto font-semibold">1 cent / email</p>
        <div className="flex items-center gap-4 mt-6">
          <Link href="/login">Login</Link>
          <Link href="/register">
            <Button>
              Get started <ArrowRight />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
