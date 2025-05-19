export default async function Layout({ children }: { children: React.ReactNode }) {
  return <div className="py-24 max-w-[700px] mx-auto">{children}</div>
}
