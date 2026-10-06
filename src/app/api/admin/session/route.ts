import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('wedding_admin_auth');

  return NextResponse.json({ authenticated: authCookie?.value === 'true' });
}
