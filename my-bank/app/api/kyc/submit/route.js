import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; 

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      email, front, back, selfie,
      // Destructure new fields
      dateOfBirth, streetAddress, city, state, zipCode, country, idType, idNumber
    } = body;

    if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 });

    // 1. Update User with ALL data
    await prisma.user.update({
      where: { email },
      data: { 
        kycStatus: 'PENDING',
        // ✅ SAVE IMAGES (Base64 strings)
        kycFront: front,
        kycBack: back,
        kycSelfie: selfie,
        // ✅ SAVE NEW FIELDS
        dateOfBirth,
        streetAddress,
        city,
        state,
        zipCode,
        country,
        idType,
        idNumber
      },
    });

    return NextResponse.json({ success: true, message: 'KYC Submitted' }, { status: 200 });

  } catch (error) {
    console.error("KYC Submit Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}