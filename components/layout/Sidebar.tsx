'use client';

import React from 'react';
import {
  Feather,
  LayoutDashboard,
  Search,
  Bookmark,
  BarChart3,
  Clock,
  Settings,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Search', href: '/', icon: Search },
    { name: 'Saved Leads', href: '/saved-leads', icon: Bookmark },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'History', href: '/history', icon: Clock },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-60 bg-fed-green-900 text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-fed-green-700">
        <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Feather className="w-6 h-6" />
          <span className="text-xl font-semibold">FedLeads</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg
                transition-colors duration-150
                ${
                  active
                    ? 'bg-fed-green-800 text-white'
                    : 'text-fed-green-100 hover:bg-fed-green-800/50 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Account */}
      <div className="p-4 border-t border-fed-green-700">
        <Link
          href="/settings"
          className="w-full flex items-center space-x-3 rounded-lg p-2 hover:bg-fed-green-800/50 transition-colors"
        >
          <Avatar
            initials="VD"
            size="md"
            className="bg-fed-green-500"
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate">My account</p>
            <p className="text-xs text-gray-400 truncate">vietd@leadd.com</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};
