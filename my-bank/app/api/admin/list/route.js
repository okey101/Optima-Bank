import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { user: true }, // Include user details (email)
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}