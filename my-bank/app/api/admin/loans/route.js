import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// GET: Fetch all loans
export async function GET() {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, accountNumber: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(loans, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}

// PUT: Update loan status (Approve/Reject)
export async function PUT(req) {
  try {
    const { loanId, status } = await req.json();
    
    // Update Loan Status
    const loan = await prisma.loan.update({
      where: { id: loanId },
      data: { status }
    });

    // OPTIONAL: If Approved, you could automatically credit the user's balance here
    // inside a transaction.
    if (status === 'APPROVED') {
       await prisma.$transaction([
          prisma.user.update({
             where: { id: loan.userId },
             data: { balance: { increment: loan.amount } }
          }),
          prisma.transaction.create({
             data: {
                 amount: loan.amount,
                 type: 'DEPOSIT',
                 status: 'APPROVED',
                 method: 'LOAN DISBURSEMENT',
                 userId: loan.userId
             }
          })
       ]);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}