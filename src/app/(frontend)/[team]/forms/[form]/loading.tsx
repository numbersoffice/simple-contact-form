import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="w-[80px] h-[36px] rounded-md" />
      <Skeleton className="w-[278px] h-[64px] rounded-md" />
      <Skeleton className="w-[269px] h-[72px] rounded-md" />
      <Skeleton className="w-full h-[146px] rounded-md" />
    </div>
  )
}
