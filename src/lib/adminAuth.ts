import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Paras%956';

export interface AdminSession {
  username: string;
  loginTime: number;
}

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function createAdminSession(): AdminSession {
  return {
    username: ADMIN_USERNAME,
    loginTime: Date.now()
  };
}

export function verifyAdminSession(sessionData: string): boolean {
  try {
    const session: AdminSession = JSON.parse(sessionData);
    const now = Date.now();
    const sessionAge = now - session.loginTime;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return session.username === ADMIN_USERNAME && sessionAge < maxAge;
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin-session');
  
  if (!sessionCookie || !verifyAdminSession(sessionCookie.value)) {
    return null;
  }
  
  return JSON.parse(sessionCookie.value);
}
