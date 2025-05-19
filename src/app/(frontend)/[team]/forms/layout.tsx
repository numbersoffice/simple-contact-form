import { HeaderPage } from '@/components/header-page'
import { ReactNode } from 'react'

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderPage
        title="Forms"
        description="Create forms to receive submissions from your sites. Each form can have separate settings for recipients, and spam filtering."
      />

      <div className="p-4 lg:px-6">{children}</div>
    </>
  )
}
