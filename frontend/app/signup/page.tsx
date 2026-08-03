'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorMessage from '@/components/ErrorMessage';
import { UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { stashPendingDisplayName } from '@/lib/supabase/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (data.user && data.session) {
      // We have a live session immediately — the profiles row already
      // exists (created by the on_auth_user_created trigger), just fill
      // in the display name.
      if (displayName.trim()) {
        await supabase
          .from('profiles')
          .update({ display_name: displayName.trim() })
          .eq('id', data.user.id);
      }
      router.push('/dashboard');
      router.refresh();
      return;
    }

    // Email confirmation is required — no session yet. Stash the display
    // name so it gets applied automatically on first login.
    if (displayName.trim()) {
      stashPendingDisplayName(email, displayName.trim());
    }
    setNeedsConfirmation(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Create your account</h1>
              <p className="text-gray-600">Start tailoring resumes with refactr</p>
            </div>

            {needsConfirmation ? (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm text-center">
                We sent a confirmation link to <span className="font-semibold">{email}</span>.
                Click it to activate your account, then log in.
              </div>
            ) : (
              <>
            {error && (
              <div className="mb-6">
                <ErrorMessage message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
                  placeholder="Jane Doe"
                />
              </div>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
                  placeholder="At least 6 characters"
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
                {isLoading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>
              </>
            )}

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
