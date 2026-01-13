import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Remove sensitive data
    const { password, pin, ...safeUser } = user;

    return NextResponse.json({ user: safeUser }, { status: 200 });

  } catch (error) {
    console.error("Refresh Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}