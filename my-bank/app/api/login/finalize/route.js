import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, pin, otp } = await req.json();
    const currentDevice = req.headers.get('user-agent') || 'Unknown Device';

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // 1. Verify New Device OTP (if provided/required)
    if (otp) {
        if (user.loginOTP !== otp || new Date() > user.loginOTPExpires) {
            return NextResponse.json({ message: 'Invalid or expired device code' }, { status: 400 });
        }
    }

    // 2. Verify PIN
    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
        return NextResponse.json({ message: 'Invalid PIN' }, { status: 400 });
    }

    // 3. Success! Update Trusted Device & Clear OTP
    await prisma.user.update({
        where: { email },
        data: { 
            lastDevice: currentDevice, // Trust this device now
            loginOTP: null,
            loginOTPExpires: null
        }
    });

    const { password: _, pin: __, ...userWithoutSecrets } = user;

    return NextResponse.json({ 
      success: true, 
      user: userWithoutSecrets 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}