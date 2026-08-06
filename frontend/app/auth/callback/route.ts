import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function safeRedirectTarget(value: string | null): string {
  // Only allow same-site relative paths - reject absolute/protocol-relative URLs to avoid an open redirect.
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeRedirectTarget(searchParams.get('redirect'));

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
