import { NextResponse } from 'next/server';

const securityHeaders = [
  ['Content-Security-Policy', "base-uri 'self'; frame-ancestors 'none'; object-src 'none'"],
  ['Permissions-Policy', 'camera=(), geolocation=(), microphone=()'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Strict-Transport-Security', 'max-age=31536000'],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
] as const;

export function proxy() {
  const response = NextResponse.next();
  for (const [key, value] of securityHeaders) response.headers.set(key, value);
  return response;
}

export const config = { matcher: '/:path*' };
