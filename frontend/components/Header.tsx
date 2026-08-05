'use client';

import Link from 'next/link';
import { Copy } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import UserMenu from './UserMenu';

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b border-black bg-white">
      <div className="container mx-auto px-6 md:px-10 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Copy className="w-7 h-7 text-black" strokeWidth={2.25} />
            <span className="text-[32px] font-bold text-black lowercase leading-none">refactr</span>
          </Link>

          <nav className="flex items-center gap-12">
            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[20px] font-medium text-black hover:text-[#187fe7] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center bg-[#187fe7] hover:bg-[#146bc7] text-white font-medium text-[16px] px-6 py-3.5 rounded-[14px] shadow-[0px_4px_2px_rgba(0,0,0,0.25)] transition-colors"
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
