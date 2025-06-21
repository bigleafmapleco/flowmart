'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, ShoppingCart, Tags } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    name: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    name: 'Sales',
    href: '/sales', 
    icon: ShoppingCart,
  },
  {
    name: 'Categories',
    href: '/categories',
    icon: Tags,
  },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="w-64 min-h-screen bg-gray-50 border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">FlowMart</h2>
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
} 