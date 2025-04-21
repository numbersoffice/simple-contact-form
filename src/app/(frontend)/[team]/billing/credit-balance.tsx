import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Info } from 'lucide-react'

interface CreditBalanceProps {
  amount: number
}

export default function CreditBalance({ amount }: CreditBalanceProps) {
  const costPerSubmission = 1 // Cost per submission in USD
  const submissionsRemaining = Math.floor(amount / costPerSubmission)
  const formattedSubmissionsRemaining = submissionsRemaining.toLocaleString()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="leading-none font-semibold mb-1">Pay as you go</h1>
      </div>

      <div className="flex flex-col">
        <div className="text-muted-foreground text-sm flex items-center gap-1">
          Credit balance
          <HoverCard openDelay={0} closeDelay={200}>
            <HoverCardTrigger>
              <Info className="w-[14px]" />
            </HoverCardTrigger>
            <HoverCardContent className="text-sm">
              Your credit balance will be consumed as you receive submissions. Each submission costs
              <span className="text-blue-400"> ${costPerSubmission / 100}</span>
            </HoverCardContent>
          </HoverCard>
        </div>
        <span className="text-4xl mb-1">{'$' + (amount / 100).toFixed(2).toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">
          {formattedSubmissionsRemaining} form submissions remaining
        </span>
      </div>
    </div>
  )
}
