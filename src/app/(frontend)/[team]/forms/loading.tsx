import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="w-[129px] h-[36px] rounded-md mr-0 ml-auto" />
      <Skeleton className="w-full h-[80px] rounded-md" />
    </div>
  )
}
