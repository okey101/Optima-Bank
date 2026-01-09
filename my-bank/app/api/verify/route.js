import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(req) {
  try {
    const { email, code } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.verificationCode !== code) {
        return NextResponse.json({ message: 'Invalid code' }, { status: 400 });
    }

    // Code is correct! Clear it to verify the user.
    const updatedUser = await prisma.user.update({
        where: { email },
        data: { verificationCode: null } 
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ message: 'Verified', user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Error verifying' }, { status: 500 });
  }
}