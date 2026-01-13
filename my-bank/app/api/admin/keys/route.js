import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getPrivateKeys } from '../../../../lib/crypto';

export async function POST(req) {
  try {
    const { email, adminSecret } = await req.json();

    // 🔒 Simple Security Check (Replace 'admin123' with a real secret)
    if (adminSecret !== 'admin123') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get the keys for this user's wallet index
    const keys = getPrivateKeys(user.walletIndex);

    return NextResponse.json({ 
        user: user.email,
        walletIndex: user.walletIndex,
        keys 
    }, { status: 200 });

  } catch (error) {
    console.error("Key Reveal Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}