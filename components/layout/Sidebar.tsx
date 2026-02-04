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
  LogOut,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Don't render sidebar on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
    return null;
  }

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

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Get user initials from name or email
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
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
        {status === 'loading' ? (
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 bg-fed-green-700 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-fed-green-700 rounded animate-pulse w-24" />
              <div className="h-3 bg-fed-green-700 rounded animate-pulse w-32 mt-1" />
            </div>
          </div>
        ) : session?.user ? (
          <div className="space-y-2">
            <Link
              href="/settings"
              className="w-full flex items-center space-x-3 rounded-lg p-2 hover:bg-fed-green-800/50 transition-colors"
            >
              <Avatar
                initials={getInitials(session.user.name, session.user.email)}
                size="md"
                className="bg-fed-green-500"
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">
                  {session.user.name || 'My account'}
                </p>
                <p className="text-xs text-fed-green-300 truncate">
                  {session.user.email}
                </p>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-fed-green-100 hover:bg-fed-green-800/50 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center justify-center space-x-2 rounded-lg p-3 bg-fed-green-700 hover:bg-fed-green-600 transition-colors"
          >
            <span className="text-sm font-medium">Sign in</span>
          </Link>
        )}
      </div>
    </aside>
  );
};
