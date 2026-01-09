import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const { transactionId } = await req.json();

    // 1. Get the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'APPROVED') {
      return NextResponse.json({ message: 'Already approved' }, { status: 400 });
    }

    // 2. Add Money to User Balance
    await prisma.user.update({
      where: { id: transaction.userId },
      data: {
        balance: { increment: transaction.amount }
      }
    });

    // 3. Mark Transaction as APPROVED
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'APPROVED' }
    });

    return NextResponse.json({ 
      message: 'Deposit Approved & Balance Updated', 
      transaction: updatedTransaction 
    }, { status: 200 });

  } catch (error) {
    console.error("Approval Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}