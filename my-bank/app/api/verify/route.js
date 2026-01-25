import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(req) {
  try {
    const { email, code } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // ✅ FIX: Allow login if ALREADY verified
    if (user.isEmailVerified) {
         const { password: _, ...userWithoutPassword } = user;
         return NextResponse.json({ message: 'Already Verified', user: userWithoutPassword }, { status: 200 });
    }

    if (user.verificationCode !== code) {
        return NextResponse.json({ message: 'Invalid code' }, { status: 400 });
    }

    // Code is correct! Clear it AND mark user as verified.
    const updatedUser = await prisma.user.update({
        where: { email },
        data: { 
            verificationCode: null,
            isEmailVerified: true 
        } 
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ message: 'Verified', user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error verifying' }, { status: 500 });
  }
}