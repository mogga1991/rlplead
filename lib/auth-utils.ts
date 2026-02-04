import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Get current user session on server components
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return session.user;
}

/**
 * Get session for API routes
 */
export async function getApiSession() {
  const session = await auth();
  return session;
}
