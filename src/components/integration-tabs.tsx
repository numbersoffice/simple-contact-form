'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CopyableCode from '@/components/copyable-code'

interface CodeTab {
  id: string
  label: string
  code: string
  highlightedHtml: string
  description: string
}

export default function IntegrationTabs({ tabs }: { tabs: CodeTab[] }) {
  return (
    <Tabs defaultValue={tabs[0]?.id} className="w-full">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="cursor-pointer">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          <CopyableCode code={tab.code}>
            <div
              dangerouslySetInnerHTML={{ __html: tab.highlightedHtml }}
              className="[&_*]:text-[14px] [&_*]:!bg-zinc-900 [&>pre]:!m-0 [&>pre]:!p-4 overflow-hidden rounded-md"
            />
          </CopyableCode>
          <p className="text-xs text-muted-foreground mt-2">{tab.description}</p>
        </TabsContent>
      ))}
    </Tabs>
  )
}
