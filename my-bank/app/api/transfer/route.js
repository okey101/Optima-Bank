import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { senderEmail, recipientId, amount, pin } = await req.json();

    const transferAmount = parseFloat(amount);

    // 1. Fetch Sender
    const sender = await prisma.user.findUnique({ where: { email: senderEmail } });
    if (!sender) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // 2. Verify PIN
    const isPinValid = await bcrypt.compare(pin, sender.pin);
    if (!isPinValid) return NextResponse.json({ message: 'Invalid PIN' }, { status: 401 });

    // 3. Check Balance
    if (sender.balance < transferAmount) return NextResponse.json({ message: 'Insufficient funds' }, { status: 400 });

    // 4. Fetch Recipient (By ID this time, safer)
    const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
    if (!recipient) return NextResponse.json({ message: 'Recipient not found' }, { status: 404 });

    if (sender.id === recipient.id) return NextResponse.json({ message: 'Cannot transfer to self' }, { status: 400 });

    // 5. Execute Transfer
    await prisma.$transaction([
        prisma.user.update({
            where: { email: senderEmail },
            data: { balance: { decrement: transferAmount } }
        }),
        prisma.user.update({
            where: { id: recipientId },
            data: { balance: { increment: transferAmount } }
        }),
        prisma.transaction.create({
            data: {
                amount: transferAmount,
                type: 'TRANSFER',
                status: 'APPROVED',
                method: `SENT TO ${recipient.firstName}`,
                userId: sender.id
            }
        }),
        prisma.transaction.create({
            data: {
                amount: transferAmount,
                type: 'DEPOSIT',
                status: 'APPROVED',
                method: `RECEIVED FROM ${sender.firstName}`,
                userId: recipient.id
            }
        })
    ]);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Transfer failed' }, { status: 500 });
  }
}