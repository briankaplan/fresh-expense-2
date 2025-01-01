'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    title: 'Profile',
    href: '/settings/profile'
  },
  {
    title: 'Integrations',
    href: '/settings/integrations'
  },
  {
    title: 'Notifications',
    href: '/settings/notifications'
  }
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0">
      <nav>
        <ul className="space-y-2">
          {menuItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'block px-4 py-2 rounded-md transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  pathname === item.href && 'bg-gray-100 dark:bg-gray-800 font-medium'
                )}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
} 