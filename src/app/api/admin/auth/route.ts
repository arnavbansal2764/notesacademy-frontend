import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials, createAdminSession } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const session = createAdminSession();
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('admin-session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin-session');
  return response;
}
