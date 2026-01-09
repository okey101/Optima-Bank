import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // ✅ Fixed: 3 levels up (app -> api -> login)
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Check Password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Check Email Verification
    if (user.isEmailVerified === false) { 
      return NextResponse.json({ 
        message: 'Please verify your email address before logging in.' 
      }, { status: 403 });
    }

    // 4. Return User (Success)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword 
    }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}