import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(req) {
  console.log("----- DEPOSIT REQUEST -----");
  try {
    const { email, amount } = await req.json();

    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 2. Create Transaction Record (Status: PENDING)
    // We DO NOT update the user.balance here anymore.
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type: 'DEPOSIT',
        status: 'PENDING',
        method: 'CRYPTO', // You can make this dynamic later
        userId: user.id
      }
    });

    console.log(`Deposit Request Logged: $${amount} for ${email}`);

    return NextResponse.json({ 
      message: 'Deposit request sent. Waiting for approval.', 
      transaction 
    }, { status: 200 });

  } catch (error) {
    console.error("Deposit Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}