import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { kycStatus: 'PENDING' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        kycStatus: true,
        kycFront: true,
        kycBack: true,
        kycSelfie: true,
        // ✅ FETCH NEW FIELDS
        dateOfBirth: true,
        streetAddress: true,
        city: true,
        country: true,
        idType: true,
        idNumber: true
      }
    });

    return NextResponse.json(pendingUsers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

// 2. PUT: Approve or Reject a user
export async function PUT(req) {
  try {
    const { userId, action } = await req.json(); // action = 'APPROVE' or 'REJECT'

    const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';

    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: newStatus }
    });

    return NextResponse.json({ success: true, status: newStatus }, { status: 200 });

  } catch (error) {
    console.error("Admin KYC Update Error:", error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}