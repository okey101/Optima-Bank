import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; // ✅ Fixed path (4 levels up)

export async function POST(req) {
  try {
    const { email, front, back, selfie } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // 1. Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 2. Update User Status to PENDING
    /* NOTE: We are updating the status to 'PENDING' so the Dashboard knows 
       the user has applied. We are NOT saving the heavy Base64 image strings 
       to the database to prevent performance issues. 
       In a real production app, you would upload these to AWS S3 or Cloudinary.
    */
    await prisma.user.update({
      where: { email },
      data: { 
        kycStatus: 'PENDING' 
      },
    });

    return NextResponse.json({ success: true, message: 'KYC Submitted' }, { status: 200 });

  } catch (error) {
    console.error("KYC Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}