import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, pin } = body;

    console.log("Login Finalize Attempt:", { email, pinProvided: !!pin });

    // 1. Validate Input
    if (!email || !pin) {
      return NextResponse.json({ message: 'Email and PIN are required' }, { status: 400 });
    }

    // 2. Find User
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("User not found during PIN check");
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 3. Verify PIN (using bcrypt)
    // We check if user.pin exists to prevent crashes on old accounts
    if (!user.pin) {
        return NextResponse.json({ message: 'Account has no PIN set' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(pin, user.pin);

    if (isMatch) {
      // Login Success!
      // You might want to set a session cookie here if using JWT
      return NextResponse.json({ 
          message: 'Login successful', 
          user: { 
              firstName: user.firstName, 
              lastName: user.lastName, 
              email: user.email,
              balance: user.balance,
              accountNumber: user.accountNumber 
          } 
      }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid PIN' }, { status: 401 });
    }

  } catch (error) {
    console.error("PIN Verification Error:", error); // <--- This will show the real error in your terminal
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}