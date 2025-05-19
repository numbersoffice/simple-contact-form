import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="w-[110px] h-[16px] rounded-md" />
      <Skeleton className="w-[160px] h-[88px] rounded-md" />
      <Skeleton className="w-[173px] h-[36px] rounded-md" />
      <Skeleton className="w-full h-[94px] rounded-md" />
      <Skeleton className="w-full h-[200px] rounded-md" />
    </div>
  )
}
