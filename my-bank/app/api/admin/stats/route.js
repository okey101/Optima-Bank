import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const pendingKycCount = await prisma.user.count({ where: { kycStatus: 'PENDING' } });
    
    return NextResponse.json({ 
        users: userCount, 
        pendingKyc: pendingKycCount 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}