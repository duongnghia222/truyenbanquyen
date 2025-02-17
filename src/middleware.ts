import NextAuth from 'next-auth'
import { config as authConfig } from '@/app/auth'

export { auth as middleware } from '@/app/auth'

export const config = {
  matcher: [
    '/profile/:path*',
    '/bookmark/:path*',
    '/api/auth/:path*'
  ]
} 