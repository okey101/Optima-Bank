import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    
    // 1. Destructure 'documents' along with other fields
    const { 
      email, 
      amount, 
      duration, 
      purpose, 
      employmentStatus, 
      monthlyIncome, 
      employerName, 
      housingStatus,
      documents // <--- Important: Receive the documents object
    } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // 2. Create Loan with document links
    const loan = await prisma.loan.create({
      data: {
        amount: parseFloat(amount),
        duration: parseInt(duration),
        purpose,
        employmentStatus,
        monthlyIncome: parseFloat(monthlyIncome),
        employerName,
        housingStatus,
        userId: user.id,
        status: 'PENDING',
        
        // 3. Save the filenames to the database
        idProof: documents?.idProof || null,
        incomeProof: documents?.incomeProof || null,
        addressProof: documents?.addressProof || null
      }
    });

    return NextResponse.json({ success: true, loan }, { status: 200 });

  } catch (error) {
    console.error("Loan Application Error:", error);
    return NextResponse.json({ message: 'Application failed' }, { status: 500 });
  }
}