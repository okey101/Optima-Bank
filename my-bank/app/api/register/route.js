import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { generateWallet } from '../../../lib/crypto';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    // 1. EXTRACT 'pin' ALONG WITH OTHER FIELDS
    const { firstName, lastName, email, phone, password, pin } = await req.json();

    // 2. CHECK IF USER EXISTS
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // 3. GENERATE WALLETS
    const userCount = await prisma.user.count();
    const walletIndex = userCount; // Sequential index: 0, 1, 2...
    const { ethAddress, btcAddress, solAddress, trxAddress } = generateWallet(walletIndex);

    // 4. HASH PASSWORD AND PIN
    const hashedPassword = await bcrypt.hash(password, 10);
    // ⚠️ NEW: Hash the PIN before saving it
    const hashedPin = await bcrypt.hash(pin, 10); 

    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 5. SEND EMAIL (Your Original Template Restored)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Finora Security" <${process.env.GMAIL_USER}>`, 
      to: email,
      subject: 'Verify your Finora Account',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
            
            <div style="background-color: #2563eb; padding: 30px; text-align: center;">
               <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">FINORA</h1>
            </div>

            <div style="padding: 40px 30px;">
              <h2 style="color: #111827; margin-top: 0;">Hello ${firstName},</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                Welcome to Finora Bank. To complete your registration and secure your account, please use the verification code below.
              </p>

              <div style="margin: 30px 0; text-align: center;">
                <span style="background-color: #f3f4f6; color: #111827; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px; border: 1px solid #e5e7eb; display: inline-block;">
                  ${verificationCode}
                </span>
              </div>

              <p style="color: #4b5563; font-size: 14px;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 Finora Financial Services. All rights reserved.</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0;">123 Banking Street, Finance City</p>
            </div>

          </div>
        </body>
        </html>
      `,
      text: `Welcome to Finora. Your verification code is ${verificationCode}`
    });

    // 6. CREATE USER (Now includes 'pin')
    await prisma.user.create({
      data: {
        firstName, lastName, email, phone, 
        password: hashedPassword, 
        pin: hashedPin, // <--- ✅ PIN SAVED HERE
        accountNumber, 
        balance: 0.00, walletIndex,
        ethAddress,
        btcAddress,
        solAddress,
        trxAddress,
        verificationCode 
      },
    });

    return NextResponse.json({ message: 'Code sent' }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}