'use client'

import { Button } from '@/components/ui/button'
import { ClipboardCopy } from 'lucide-react'
import { toast } from 'sonner'
import { ReactNode } from 'react'

export default function CopyableCode({
  code,
  children,
}: {
  code: string
  children: ReactNode
}) {
  function handleCopy() {
    navigator.clipboard.writeText(code)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="relative group">
      {children}
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
        onClick={handleCopy}
      >
        <ClipboardCopy size={16} />
      </Button>
    </div>
  )
}
