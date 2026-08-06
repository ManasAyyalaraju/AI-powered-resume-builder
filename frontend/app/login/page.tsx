'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';
import AuthInput from '@/components/AuthInput';
import AuthProductGraphic from '@/components/AuthProductGraphic';
import GoogleIcon from '@/components/GoogleIcon';
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

  const redirectParam = searchParams.get('redirect');

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

    router.push(safeRedirectTarget(redirectParam));
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const redirectTo = `${window.location.origin}/auth/callback${
      redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''
    }`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (oauthError) {
      setError(oauthError.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="flex flex-col w-full md:flex-1 p-6 sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 shrink-0">
          <div className="relative w-8 h-[30px] shrink-0">
            <div className="absolute left-0 top-0 w-[23px] h-[21px] rounded-[3px] border-[2.5px] border-black bg-white" />
            <div className="absolute left-[7px] top-[6px] w-[23px] h-[21px] rounded-[3px] border-[2.5px] border-black bg-white" />
          </div>
          <span className="font-bold text-[32px] text-black">refactr</span>
        </Link>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-0 sm:px-16 py-12">
          <h1 className="font-bold text-[32px] sm:text-[40px] leading-[1.1] tracking-[-1.6px] text-[#232323] text-center">
            Sign In
          </h1>

          {error && (
            <div className="w-full max-w-[399px]">
              <ErrorMessage message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-[399px] flex flex-col gap-5">
            <AuthInput
              id="email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <AuthInput
              id="password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center px-2 py-4 rounded-[10px] font-semibold text-[18px] tracking-[-0.18px] transition-colors cursor-pointer ${
                isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#187fe7] hover:bg-[#146bc7] text-white'
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <div className="flex items-center gap-2.5 w-full">
              <div className="flex-1 h-px bg-[#d9d9d9]" />
              <span className="text-[16px] font-medium text-[#6e6e6e]">or</span>
              <div className="flex-1 h-px bg-[#d9d9d9]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-[54px] flex items-center justify-center gap-2 px-2 rounded-[10px] border-2 border-[#e6e8e7] bg-white font-semibold text-[18px] tracking-[-0.18px] text-[#232323] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Continue with Google
              <GoogleIcon className="w-6 h-6" />
            </button>
          </form>

          <p className="text-[18px] text-[#6c6c6c] text-center">
            Need an account??{' '}
            <Link
              href={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : '/signup'}
              className="font-semibold text-[#187fe7] underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden md:flex w-[849px] max-w-[45vw] h-auto p-3 shrink-0">
        <div className="flex-1 rounded-2xl overflow-hidden">
          <AuthProductGraphic className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
