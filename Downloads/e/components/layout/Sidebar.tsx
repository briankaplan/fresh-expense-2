'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: 'HomeIcon'
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: 'DollarIcon'
  },
  {
    title: 'Receipts',
    href: '/receipts',
    icon: 'ReceiptIcon'
  },
  {
    title: 'Subscriptions',
    href: '/subscriptions',
    icon: 'RepeatIcon'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'SettingsIcon'
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-background lg:block lg:w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "transparent hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 