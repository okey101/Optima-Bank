import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// ✅ UPDATED: Fees will now be sent to this email
const TREASURY_EMAIL = 'okeyogidi6@gmail.com'; 

// Helper to generate random 16-digit number
const generateCardNumber = () => {
  let num = '4'; // Visa starts with 4
  for (let i = 0; i < 15; i++) num += Math.floor(Math.random() * 10);
  return num.match(/.{1,4}/g).join(' ');
};

const generateCVV = () => Math.floor(100 + Math.random() * 900).toString();

const generateExpiry = () => {
  const today = new Date();
  const year = today.getFullYear() + 3; 
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${month}/${year.toString().slice(-2)}`;
};

export async function POST(req) {
  try {
    const { email, tier, price } = await req.json();

    if (!email || !tier || !price) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 1. Get User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 2. Check Balance
    if (user.balance < price) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // GENERATE CARD DETAILS
    const newCardNumber = generateCardNumber();
    const newCVV = generateCVV();
    const newExpiry = generateExpiry();

    // 3. ATOMIC TRANSACTION: Move Money & Create Card
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Deduct from User
      const updatedUser = await tx.user.update({
        where: { email },
        data: { balance: { decrement: price } }
      });

      // B. Add to Treasury (If it exists)
      try {
        await tx.user.update({
          where: { email: TREASURY_EMAIL },
          data: { balance: { increment: price } }
        });
      } catch (err) {
        console.warn(`Treasury account (${TREASURY_EMAIL}) not found. Funds deducted but not credited.`);
      }

      // C. Log Transaction for User (Debit)
      await tx.transaction.create({
        data: {
          amount: price,
          type: 'CARD_ISSUANCE', 
          status: 'APPROVED',
          method: `${tier.toUpperCase()} CARD FEE`,
          userId: user.id
        }
      });

      // D. Log Transaction for Treasury (Credit) - Optional but good for records
      const treasuryUser = await tx.user.findUnique({ where: { email: TREASURY_EMAIL } });
      if (treasuryUser) {
        await tx.transaction.create({
          data: {
            amount: price,
            type: 'REVENUE', 
            status: 'APPROVED',
            method: `FEE FROM ${user.firstName.toUpperCase()}`,
            userId: treasuryUser.id
          }
        });
      }

      // E. SAVE THE CARD
      const newCard = await tx.card.create({
        data: {
          cardNumber: newCardNumber,
          cvv: newCVV,
          expiryDate: newExpiry,
          type: tier,
          userId: user.id
        }
      });

      return { user: updatedUser, card: newCard };
    });

    return NextResponse.json({ success: true, card: result.card, balance: result.user.balance });

  } catch (error) {
    console.error("Card Payment Error:", error);
    return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
  }
}