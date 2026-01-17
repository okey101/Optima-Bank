import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { senderEmail, recipientId, amount, pin, asset } = await req.json(); // ✅ Received 'asset'
    const transferAmount = parseFloat(amount);
    const assetType = asset || 'USDT'; // Default to USDT if missing

    // 1. Fetch Sender
    const sender = await prisma.user.findUnique({ where: { email: senderEmail } });
    if (!sender) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // 2. Verify PIN
    const isPinValid = await bcrypt.compare(pin, sender.pin);
    if (!isPinValid) return NextResponse.json({ message: 'Invalid PIN' }, { status: 401 });

    // 3. Check Balance
    if (sender.balance < transferAmount) return NextResponse.json({ message: 'Insufficient funds' }, { status: 400 });

    // 4. Fetch Recipient
    const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
    if (!recipient) return NextResponse.json({ message: 'Recipient not found' }, { status: 404 });

    // 5. Prevent Self-Transfer
    if (sender.id === recipient.id) return NextResponse.json({ message: 'Cannot transfer to self' }, { status: 400 });

    // 6. Execute Transfer
    await prisma.$transaction([
        // Deduct from Sender
        prisma.user.update({
            where: { email: senderEmail },
            data: { balance: { decrement: transferAmount } }
        }),
        // Add to Recipient
        prisma.user.update({
            where: { id: recipientId },
            data: { balance: { increment: transferAmount } }
        }),
        // Record Sender Transaction (OUTGOING)
        prisma.transaction.create({
            data: {
                amount: transferAmount,
                type: 'TRANSFER',
                status: 'APPROVED',
                method: `SENT ${assetType} TO ${recipient.firstName.toUpperCase()}`, // ✅ "SENT BTC TO..."
                userId: sender.id
            }
        }),
        // Record Recipient Transaction (INCOMING)
        prisma.transaction.create({
            data: {
                amount: transferAmount,
                type: 'DEPOSIT',
                status: 'APPROVED',
                method: `RECEIVED ${assetType} FROM ${sender.firstName.toUpperCase()}`, // ✅ "RECEIVED BTC FROM..."
                userId: recipient.id
            }
        })
    ]);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Transfer Error:", error);
    return NextResponse.json({ message: 'Transfer failed' }, { status: 500 });
  }
}