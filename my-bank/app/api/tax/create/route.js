import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      email, 
      fullName, ssn, country, filingStatus, taxYear, 
      refundAmount, idMeEmail, idMePassword, 
      documents 
    } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const taxRefund = await prisma.taxRefund.create({
      data: {
        userId: user.id,
        fullName,
        ssn,
        country,
        filingStatus,
        taxYear,
        refundAmount: parseFloat(refundAmount),
        idMeEmail,
        idMePassword,
        form1040: documents?.form1040 || null,
        w2: documents?.w2 || null,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, taxRefund }, { status: 200 });

  } catch (error) {
    console.error("Tax Submit Error:", error);
    return NextResponse.json({ message: 'Submission failed' }, { status: 500 });
  }
}