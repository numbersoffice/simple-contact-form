import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

export default function ElementLock({
  locked,
  children,
  align = 'center',
  side = 'top',
  sideOffset = 0,
}: {
  locked: boolean
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
}) {
  if (locked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="w-fit h-fit relative opacity-30 pointer-events-none">{children}</div>
          </TooltipTrigger>
          <TooltipContent align={align} side={side} sideOffset={sideOffset} className="w-fit">
            <p>Owners only</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  } else return children
}
