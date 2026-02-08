'use client'

import { ClipboardCopy } from 'lucide-react'
import { toast } from 'sonner'

export default function CopyableFormId({ formId }: { formId: string }) {
  function handleCopy() {
    navigator.clipboard.writeText(formId)
    toast.success('Form ID copied')
  }

  return (
    <button
      type="button"
      className="cursor-pointer inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-sm"
      onClick={handleCopy}
    >
      <span className="max-w-[180px] truncate">{formId}</span>
      <ClipboardCopy size={14} className="text-muted-foreground shrink-0" />
    </button>
  )
}
