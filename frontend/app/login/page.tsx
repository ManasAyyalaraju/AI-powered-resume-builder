'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorMessage from '@/components/ErrorMessage';
import { LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function safeRedirectTarget(value: string | null): string {
  // Only allow same-site relative paths - reject absolute/protocol-relative URLs to avoid an open redirect.
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    router.push(safeRedirectTarget(searchParams.get('redirect')));
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <LogIn className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Log in</h1>
              <p className="text-gray-600">Welcome back to refactr</p>
            </div>

            {error && (
              <div className="mb-6">
                <ErrorMessage message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full inline-flex items-center justify-center gap-2
                  px-6 py-3 rounded-lg font-semibold
                  shadow-md hover:shadow-lg transition-all duration-200
                  ${isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  }
                `}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href={searchParams.get('redirect') ? `/signup?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : '/signup'}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
