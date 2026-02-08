import { HeaderPage } from '@/components/header-page'
import { ReactNode } from 'react'

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderPage title="Settings" />
      <div className="p-4 lg:px-6">{children}</div>
    </>
  )
}
