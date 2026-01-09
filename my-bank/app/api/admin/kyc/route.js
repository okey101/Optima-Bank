import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// 1. GET: Fetch all users with PENDING status (INCLUDING IMAGES)
export async function GET() {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        kycStatus: 'PENDING'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        kycStatus: true,
        kycFront: true,   // ✅ Fetch Front ID
        kycBack: true,    // ✅ Fetch Back ID
        kycSelfie: true   // ✅ Fetch Selfie
      }
    });

    return NextResponse.json(pendingUsers, { status: 200 });
  } catch (error) {
    console.error("Admin KYC Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
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