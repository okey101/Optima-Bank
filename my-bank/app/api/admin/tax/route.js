import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// GET: Fetch all tax requests
export async function GET() {
  try {
    const requests = await prisma.taxRefund.findMany({
      include: {
        user: { select: { email: true, accountNumber: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PUT: Update status
export async function PUT(req) {
  try {
    const { id, status } = await req.json();
    await prisma.taxRefund.update({
      where: { id },
      data: { status }
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}