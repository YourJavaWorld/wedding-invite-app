import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminPassword } from '@/lib/server-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body.password === 'string' ? body.password : '';

    if (password !== getAdminPassword()) {
      return NextResponse.json({ ok: false, message: 'Invalid password.' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('wedding_admin_auth', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: 'Something went wrong.' }, { status: 500 });
  }
}
