import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { pin } = await req.json();

    // 🔐 YOUR ADMIN PIN: 194759
    if (pin === '194759') { 
      
      // ✅ FIX: await cookies() for Next.js 15+
      const cookieStore = await cookies();
      
      cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, // 1 hour
        path: '/',
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid PIN' }, { status: 401 });
    }

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}