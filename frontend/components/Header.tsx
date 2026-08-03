'use client';

import Link from 'next/link';
import { Copy } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import UserMenu from './UserMenu';

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Copy className="w-5 h-5 text-gray-900" strokeWidth={2.25} />
            <span className="text-xl font-bold text-gray-900 lowercase">refactr</span>
          </Link>

          <nav className="flex items-center gap-6">
            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-full transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
