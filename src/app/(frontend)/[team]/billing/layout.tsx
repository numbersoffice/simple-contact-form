import { HeaderPage } from '@/components/header-page'
import { ReactNode } from 'react'

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderPage title="Billing" description="Manage your credits and payment methods" />
      <div className="p-4 lg:px-6">{children}</div>
    </>
  )
}
