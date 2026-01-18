import { NextResponse } from 'next/server';
import { createAdminToken, COOKIE_NAME } from '../../../../lib/adminAuth';

export async function POST(req: Request) {
  try {
    const { password } = await req.json().catch(() => ({}));
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ message: 'Admin password not configured on server' }, { status: 500 });
    }
    if (!password) {
      return NextResponse.json({ message: 'Missing password' }, { status: 400 });
    }
    if (password === adminPassword) {
      // create session token and set HttpOnly cookie
      const token = createAdminToken(adminPassword);
      const maxAge = 60 * 60 * 24; // 1 day
      const cookie = `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
      return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': cookie } });
    }
    return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
  } catch (e) {
    console.error('Login error', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
