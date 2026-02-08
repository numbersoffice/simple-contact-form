import { redirect } from 'next/navigation'
import { React, Html, GitHub, Go } from '@/components/icons'

import '../../styles.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Code from '@/components/code'
import { htmlForm, reactForm, goForm } from '@/data/form-code'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import Script from 'next/script'

const demoSubmissionUrl = `${process.env.NEXT_PUBLIC_HOST_URL}/submit/YOUR_FORM_ID`

export default async function HomePage() {
  if (process.env.SHOW_LANDING_PAGE !== 'true') {
    redirect('/login')
  }

  return (
    <>
      {process.env.HOSTED && (
        <Script
          src="//gc.zgo.at/count.js"
          data-goatcounter="https://simplecontactform.goatcounter.com/count"
          async
        />
      )}
      <div>
        <Navbar withLogo={false} withAuthButtons />
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
            <Image src="/images/scf_title.jpg" width={400} height={270} alt="Simple Contact Form" />
          </div>
          <p className="text-xl text-gray-600 max-w-[550px] mx-auto text-center">
            Spam protected form submissions directly to your email inbox. No backend setup required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 max-w-[600px]">
            <div className="flex-1 border rounded-lg p-4 bg-background">
              <h3 className="font-semibold mb-1">Free to use</h3>
              <p className="text-sm text-gray-600">
                For personal use or small to medium sized businesses.
              </p>
            </div>
            <div className="flex-1 border rounded-lg p-4 bg-background">
              <h3 className="font-semibold mb-1">Self-hostable</h3>
              <p className="text-sm text-gray-600">
                Run your own instance for full control or higher volume.
              </p>
            </div>
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
              <code className="bg-gray-100 px-1 rounded text-sm">YOUR_FORM_ID</code> with your
              actual form ID.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
