'use client'

import { ClipboardCopy } from 'lucide-react'
import { toast } from 'sonner'

export default function CopyableFormId({ formId }: { formId: string }) {
  function handleCopy() {
    navigator.clipboard.writeText(formId)
    toast.success('Copied to clipboard')
  }

  return (
    <div
      className="p-2 px-4 bg-muted rounded-md w-fit font-mono flex items-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors"
      onClick={handleCopy}
    >
      {formId}
      <ClipboardCopy size={16} className="text-muted-foreground" />
    </div>
  )
}
