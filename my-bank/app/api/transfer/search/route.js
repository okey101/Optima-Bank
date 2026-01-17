import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query) return NextResponse.json({ message: 'Query required' }, { status: 400 });

    // ✅ SEARCH LOGIC: Find by Email OR Account Number (UID)
    const recipient = await prisma.user.findFirst({
        where: {
            OR: [
                { email: query },           // Match Email
                { accountNumber: query }    // ✅ Match Account ID (Uncommented this)
            ]
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            accountNumber: true         // ✅ Return the ID too (Uncommented this)
        }
    });

    if (!recipient) {
        return NextResponse.json({ found: false }, { status: 404 });
    }

    return NextResponse.json({ found: true, recipient }, { status: 200 });

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}