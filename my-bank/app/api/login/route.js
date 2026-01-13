import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    // Get User Agent from headers
    const currentDevice = req.headers.get('user-agent') || 'Unknown Device';

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isEmailVerified) { 
      return NextResponse.json({ message: 'Verify email first.' }, { status: 403 });
    }

    // --- DEVICE DETECTION LOGIC ---
    // If lastDevice is null (first login) or matches current, it's trusted.
    const isNewDevice = user.lastDevice && user.lastDevice !== currentDevice;
    
    let message = "PIN Required";
    
    if (isNewDevice) {
        // Generate OTP for New Device
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await prisma.user.update({
            where: { email },
            data: { loginOTP: otp, loginOTPExpires: expires }
        });

        // Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
        });

        await transporter.sendMail({
            from: `"Finora Security" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'New Device Login Detected',
            text: `Your login code is ${otp}. If this wasn't you, change your password.`
        });
        
        message = "New device detected. Check your email.";
    }

    // DO NOT return user data yet. Return instructions.
    return NextResponse.json({ 
      success: true, 
      requirePin: true,
      isNewDevice: !!isNewDevice, // boolean
      email: user.email,
      message 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}