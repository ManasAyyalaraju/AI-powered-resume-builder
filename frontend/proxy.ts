import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PROTECTED_PATHS = ['/tailor', '/tailored', '/results', '/dashboard', '/profile', '/extension/connect', '/resumes'];
const AUTH_PATHS = ['/login', '/signup'];

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPath) {
    const requested = request.nextUrl.searchParams.get('redirect');
    // Only allow same-site relative paths - reject absolute/protocol-relative URLs to avoid an open redirect.
    const redirectTo = requested && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/tailor/:path*',
    '/tailored/:path*',
    '/results/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/extension/connect/:path*',
    '/resumes/:path*',
    '/login',
    '/signup',
  ],
};
