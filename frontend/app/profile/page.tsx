'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { CircleUserRound, Pencil, Check, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, displayName, updateDisplayName } = useAuth();
  const supabase = createClient();
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('created_at')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setCreatedAt(data?.created_at ?? null);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const startEditing = () => {
    setNameInput(displayName || '');
    setError('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
  };

  const saveName = async () => {
    setIsSaving(true);
    setError('');
    const { error: saveError } = await updateDisplayName(nameInput);
    setIsSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setIsEditing(false);
  };

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
                  {displayName || 'No name set'}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <dl className="space-y-4">
              <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                <dt className="text-sm text-gray-500 shrink-0">Name</dt>
                <dd className="flex-1 flex items-center justify-end gap-2">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        autoFocus
                        disabled={isSaving}
                        placeholder="Your name"
                        className="flex-1 max-w-[220px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none disabled:opacity-50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveName();
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      <button
                        onClick={saveName}
                        disabled={isSaving}
                        aria-label="Save name"
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={isSaving}
                        aria-label="Cancel"
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-gray-900">
                        {displayName || 'Not set'}
                      </span>
                      <button
                        onClick={startEditing}
                        aria-label="Edit name"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </dd>
              </div>

              {error && <p className="text-sm text-red-600 text-right">{error}</p>}

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
