'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { CircleUserRound } from 'lucide-react';

interface ProfileRow {
  display_name: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name, created_at')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <CircleUserRound className="w-9 h-9 text-blue-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {loading ? '—' : profile?.display_name || 'No name set'}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <dl className="space-y-4">
              <div className="flex justify-between border-t border-gray-100 pt-4">
                <dt className="text-sm text-gray-500">Name</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {loading ? '—' : profile?.display_name || 'Not set'}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-4">
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-gray-900">{user?.email}</dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-4">
                <dt className="text-sm text-gray-500">Member since</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {loading ? '—' : memberSince || 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
