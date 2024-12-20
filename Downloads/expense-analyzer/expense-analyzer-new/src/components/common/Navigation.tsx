'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, PieChart, Upload, Settings } from 'lucide-react';

export const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: PieChart },
    { href: '/expenses', label: 'Expenses', icon: FileText },
    { href: '/upload', label: 'Upload', icon: Upload },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="flex items-center space-x-4">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center px-3 py-2 rounded-lg transition-colors
            ${pathname === href 
              ? 'bg-primary text-white' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
        >
          <Icon className="w-4 h-4 mr-2" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}; 