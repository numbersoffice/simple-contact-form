import { ArrowRight } from 'lucide-react'
import { React, Html, GitHub, Go } from '@/components/icons'

import '../styles.css'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Code from '@/components/code'
import { htmlForm, reactForm, goForm } from '@/data/form-code'
import Image from 'next/image'

const demoSubmissionUrl = `${process.env.NEXT_PUBLIC_HOST_URL}/submit/YOUR_FORM_ID`

export default async function HomePage() {
  return (
    <div>
      <section className="min-h-[85vh] flex flex-col items-center justify-center py-24 px-6 gap-6">
        <div className="relative flex flex-col items-center gap-8">
          <a
            href="https://github.com/maxibenner/simple-contact-form"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1 rounded-full flex items-center gap-1 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
            style={{ textDecoration: 'none' }}
            aria-label="View source on GitHub"
          >
            <GitHub className="mr-1" />
            View on GitHub
          </a>
          {/* <h1 className="text-5xl md:text-7xl max-w-[550px] text-center mx-auto font-bold">
            Simple <br />
            Contact Form
          </h1> */}
          <Image src="/images/scf_title.jpg" width={400} height={200} alt="Simple Contact Form" />
        </div>
        <p className="text-xl text-gray-600 max-w-[550px] mx-auto text-center">
          Spam protected form submissions directly to your email inbox. No backend setup required.
          Only pay for what you use.
        </p>
        <p className="text-center w-fit text-xl mx-auto font-semibold">1 cent / submission</p>
        <div className="flex items-center gap-4 mt-6">
          <Link href="/login">Login</Link>
          <Link href="/register">
            <Button>
              Get started <ArrowRight />
            </Button>
          </Link>
        </div>
      </section>

      <section className="flex flex-col items-center pb-24 md:pb-48 px-6">
        <Tabs defaultValue="html" className="w-full max-w-[800px]">
          <TabsList>
            <TabsTrigger value="html" className="cursor-pointer">
              <Html className="mr-1" /> HTML
            </TabsTrigger>
            <TabsTrigger value="react" className="cursor-pointer">
              <React className="mr-1" />
              React
            </TabsTrigger>
            <TabsTrigger value="go" className="cursor-pointer">
              <Go className="mr-1" />
              Golang
            </TabsTrigger>
          </TabsList>
          <TabsContent value="html">
            <Code code={htmlForm(demoSubmissionUrl)} language="html" />
          </TabsContent>
          <TabsContent value="react">
            <Code code={reactForm(demoSubmissionUrl)} language="jsx" />
          </TabsContent>
          <TabsContent value="go">
            <Code code={goForm(demoSubmissionUrl)} language="go" />
          </TabsContent>
        </Tabs>
        <div className="w-full max-w-[800px] mb-2 p-4">
          <p className="text-gray-600 text-base text-left">
            Copy and paste one of these examples into your site. Submissions will be sent to your
            configured recipients. Replace{' '}
            <code className="bg-gray-100 px-1 rounded text-sm">YOUR_FORM_ID</code> with your actual
            form ID.
          </p>
        </div>
      </section>
    </div>
  )
}
