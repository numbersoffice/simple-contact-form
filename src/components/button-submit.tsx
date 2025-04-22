import { LoaderCircle } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

export default function SubmitButton({
  children,
  loading,
  disabled,
  className,
  ...props
}: {
  children: React.ReactNode
  loading: boolean
  disabled?: boolean
  className?: string
  [key: string]: any
}) {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      type="submit"
      className={cn('relative flex flex-col items-center', className)}
    >
      <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
      <LoaderCircle
        className={`animate-spin absolute top-1/2 left-1/2 -translate-1/2 w-[18px] h-[18px] origin-[7.5px 8px] ${loading ? 'opacity-100' : 'opacity-0'}`}
      />
    </Button>
  )
}
