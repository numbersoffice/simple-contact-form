'use client'

import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function FAQ({ formId }: { formId?: string }) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!formId) return
    setSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)
    formData.append('Reason', 'Subscription cancellation')

    const res = await fetch(`https://www.simplecontactform.org/submit/${formId}`, {
      method: 'POST',
      body: formData,
    })

    // Handle response
    const data = await res.json()

    if (data.success) {
      // Handle success
      setSuccess(true)
    } else {
      // Handle error
      console.log('Error:', data)
    }

    setSubmitting(false)
  }
  return (
    <Accordion type="single" collapsible className="[&_*]:text-start">
      <AccordionItem value="item-1">
        <AccordionTrigger>How do you limit unwanted submissions?</AccordionTrigger>
        <AccordionContent>
          Alongside standard spam prevention techniques, we also use an LLM to filter out spam that
          other methods might miss.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How long does it take to get started?</AccordionTrigger>
        <AccordionContent>
          If you have worked with HTML before, it should take no longer than 5 minutes. Our personal
          record is 2 minutes!
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          No, we only provide the submission logic. You can style it however you like.
        </AccordionContent>
      </AccordionItem>
      {formId && (
        <AccordionItem value="item-4">
          <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
          <AccordionContent>
            {success ? (
              <div className="p-4 rounded-md bg-green-400">
                <h3 className="font-bold">Sucess</h3>
                <p>We will get back to you as soon as possible.</p>
              </div>
            ) : (
              <>
                Submit your form-email below to receive a cancellation link.
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col md:flex-row mt-4 gap-2 p-2 bg-gray-100 rounded-md"
                >
                  <Input placeholder="Enter your email" type="email" name="Email" />
                  <Button disabled={submitting} className="w-full">
                    {submitting ? (
                      <LoaderCircle className="w-5 h-5 mr-2 animate-spin-slow" />
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </form>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  )
}
