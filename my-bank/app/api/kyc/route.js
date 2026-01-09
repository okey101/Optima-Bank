import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// 1. GET: Fetch all Pending KYC Requests
export async function GET() {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { kycStatus: 'PENDING' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        kycFront: true,  // The ID Image
        kycBack: true,   // The Back Image
        kycSelfie: true, // The Selfie
        createdAt: true
      }
    });

    return NextResponse.json(pendingUsers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// 2. POST: Approve or Reject a User
export async function POST(req) {
  try {
    const { userId, status } = await req.json(); // status = "VERIFIED" or "REJECTED"

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: status }
    });

    return NextResponse.json({ success: true, status: updatedUser.kycStatus }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}