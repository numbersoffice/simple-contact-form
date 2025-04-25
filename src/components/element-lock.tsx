import { Lock } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

export default function ElementLock({
  locked,
  children,
}: {
  locked: boolean
  children: React.ReactNode
}) {
  if (locked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="w-fit h-fit relative">
              <div className="w-full h-full bg-white/70 rounded-md absolute top-0 left-0" />
              {/* <Lock className="w-[16px] h-[16px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /> */}
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Owners only</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  } else return children
}
