import { NavBar } from '@/components/ui/nav-bar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <NavBar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
} 