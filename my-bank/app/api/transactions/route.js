import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(req) {
  try {
    const { email, limit } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Fetch transactions (Default to 50 if 'limit' is not provided)
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 50 
    });

    return NextResponse.json(transactions, { status: 200 });

  } catch (error) {
    console.error("Transaction Fetch Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}