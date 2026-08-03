'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from './client';

interface AuthContextValue {
  user: User | null;
  displayName: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
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

    if (!data?.display_name && typeof window !== 'undefined') {
      // Signup happened before email confirmation, so the display name
      // couldn't be written yet (no session at that point) — apply it now.
      const raw = localStorage.getItem(PENDING_DISPLAY_NAME_KEY);
      if (raw) {
        const pending = JSON.parse(raw) as { email: string; displayName: string };
        if (pending.email === currentUser.email) {
          await supabase
            .from('profiles')
            .update({ display_name: pending.displayName })
            .eq('id', currentUser.id);
          localStorage.removeItem(PENDING_DISPLAY_NAME_KEY);
          setDisplayName(pending.displayName);
          return;
        }
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

  return (
    <AuthContext.Provider value={{ user, displayName, loading, signOut }}>
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
