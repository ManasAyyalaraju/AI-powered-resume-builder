'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from './client';

interface AuthContextValue {
  user: User | null;
  displayName: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PENDING_DISPLAY_NAME_KEY = 'jobcraft_pending_display_name';

export function stashPendingDisplayName(email: string, displayName: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PENDING_DISPLAY_NAME_KEY, JSON.stringify({ email, displayName }));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setDisplayName(null);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', currentUser.id)
      .single();

    if (!data?.display_name) {
      // No display name on the profile yet — backfill it from whichever
      // source has one: a pending email/password signup (stashed before
      // email confirmation, since no session existed yet to write it), or
      // the name an OAuth provider (e.g. Google) already gave us.
      let nameToApply: string | null = null;

      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(PENDING_DISPLAY_NAME_KEY);
        if (raw) {
          const pending = JSON.parse(raw) as { email: string; displayName: string };
          if (pending.email === currentUser.email) {
            nameToApply = pending.displayName;
            localStorage.removeItem(PENDING_DISPLAY_NAME_KEY);
          }
        }
      }

      if (!nameToApply) {
        const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name;
        if (typeof metaName === 'string' && metaName.trim()) {
          nameToApply = metaName.trim();
        }
      }

      if (nameToApply) {
        await supabase.from('profiles').update({ display_name: nameToApply }).eq('id', currentUser.id);
        setDisplayName(nameToApply);
        return;
      }
    }

    setDisplayName(data?.display_name ?? null);
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      await loadProfile(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDisplayName(null);
  };

  const updateDisplayName = async (name: string) => {
    if (!user) return { error: 'Not signed in.' };
    const trimmed = name.trim();
    if (!trimmed) return { error: 'Name cannot be empty.' };

    const { error } = await supabase.from('profiles').update({ display_name: trimmed }).eq('id', user.id);
    if (error) return { error: error.message };

    setDisplayName(trimmed);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, displayName, loading, signOut, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
