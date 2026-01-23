import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    // 1. Destructure all possible fields from the new frontend
    const { 
      senderEmail, 
      recipientId, 
      amount, 
      pin, 
      asset, 
      method,   // 'INTERNAL', 'LOCAL', 'WIRE', 'CRYPTO', 'PAYPAL', etc.
      details   // Object containing bank details, wallet address, or app usernames
    } = await req.json();

    const transferAmount = parseFloat(amount);
    const assetType = asset || 'USD'; 

    // 2. Fetch Sender & Validate
    const sender = await prisma.user.findUnique({ where: { email: senderEmail } });
    if (!sender) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // 3. Verify PIN
    const isPinValid = await bcrypt.compare(pin, sender.pin);
    if (!isPinValid) return NextResponse.json({ message: 'Invalid PIN' }, { status: 401 });

    // 4. Check Balance
    // Note: You might want to check specific asset balances here if your DB supports it, 
    // but checking main balance is the baseline.
    if (sender.balance < transferAmount) {
        return NextResponse.json({ message: 'Insufficient funds' }, { status: 400 });
    }

    // ============================================================
    //  SCENARIO A: INTERNAL TRANSFER (User to User)
    // ============================================================
    if (method === 'INTERNAL') {
        const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
        if (!recipient) return NextResponse.json({ message: 'Recipient not found' }, { status: 404 });
        if (sender.id === recipient.id) return NextResponse.json({ message: 'Cannot transfer to self' }, { status: 400 });

        await prisma.$transaction([
            // Deduct Sender
            prisma.user.update({
                where: { email: senderEmail },
                data: { balance: { decrement: transferAmount } }
            }),
            // Credit Recipient
            prisma.user.update({
                where: { id: recipientId },
                data: { balance: { increment: transferAmount } }
            }),
            // Record Sender Transaction
            prisma.transaction.create({
                data: {
                    amount: transferAmount,
                    type: 'TRANSFER',
                    status: 'APPROVED',
                    method: `SENT TO ${recipient.firstName.toUpperCase()}`,
                    userId: sender.id
                }
            }),
            // Record Recipient Transaction
            prisma.transaction.create({
                data: {
                    amount: transferAmount,
                    type: 'DEPOSIT',
                    status: 'APPROVED',
                    method: `RECEIVED FROM ${sender.firstName.toUpperCase()}`,
                    userId: recipient.id
                }
            })
        ]);

        return NextResponse.json({ success: true, type: 'INTERNAL' }, { status: 200 });
    }

    // ============================================================
    //  SCENARIO B: EXTERNAL TRANSFER (Bank, Wire, Crypto, Apps)
    // ============================================================
    else {
        // Construct a readable description for the Admin to see
        let description = '';

        if (method === 'LOCAL') {
            description = `LOCAL BANK: ${details.bankName} - ${details.accountNumber} (${details.accountName})`;
        } else if (method === 'WIRE') {
            description = `WIRE: ${details.bankName} (SWIFT: ${details.swiftCode}) - IBAN: ${details.iban}`;
        } else if (method === 'CRYPTO') {
            description = `CRYPTO: ${assetType} Withdrawal to ${recipientId}`; // recipientId is wallet address here
        } else {
            // PayPal, CashApp, etc.
            description = `${method}: ${recipientId}`; 
        }

        // Execute Transaction
        // We only deduct from sender and create ONE transaction record
        await prisma.$transaction([
            prisma.user.update({
                where: { email: senderEmail },
                data: { balance: { decrement: transferAmount } }
            }),
            prisma.transaction.create({
                data: {
                    amount: transferAmount,
                    type: 'WITHDRAW',     // Classify as withdrawal since it leaves the system
                    status: 'PENDING',    // IMPORTANT: Set to PENDING so Admin can approve/reject
                    method: description,  // Saves the details string we built above
                    userId: sender.id
                }
            })
        ]);

        return NextResponse.json({ success: true, type: 'EXTERNAL' }, { status: 200 });
    }

  } catch (error) {
    console.error("Transfer Error:", error);
    return NextResponse.json({ message: 'Transfer failed' }, { status: 500 });
  }
}