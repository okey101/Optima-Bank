import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';

// --- 1. SETUP NETWORK PROVIDERS ---
const providers = {
  erc20: new ethers.JsonRpcProvider('https://eth.llamarpc.com'),
  base: new ethers.JsonRpcProvider('https://mainnet.base.org'),
  bep20: new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org'),
  arb: new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc'),
  op: new ethers.JsonRpcProvider('https://mainnet.optimism.io'),
  sol: new Connection('https://api.mainnet-beta.solana.com', 'confirmed'),
};

// --- HELPER: FETCH CRYPTO PRICES (USD) ---
async function getPrice(symbol) {
  try {
    const pairs = {
      'ETH': 'ETHUSDT',
      'BNB': 'BNBUSDT',
      'SOL': 'SOLUSDT',
      'BTC': 'BTCUSDT'
    };
    
    if (!pairs[symbol]) return 1; // Default to 1:1 if stablecoin

    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pairs[symbol]}`);
    const data = await res.json();
    return parseFloat(data.price);
  } catch (e) {
    console.error("Price Fetch Error:", e);
    return 0; 
  }
}

export async function POST(req) {
  try {
    const { email, networkId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { transactions: true }
    });

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    let realBalance = 0;
    let currencySymbol = 'USDT'; 

    // --- 2. CHECK REAL BLOCKCHAIN BALANCE ---
    
    // A. EVM NETWORKS
    if (['erc20', 'base', 'bep20', 'arb', 'op'].includes(networkId)) {
       if (!user.ethAddress) return NextResponse.json({ newDeposit: false });
       const provider = providers[networkId];
       const balanceBigInt = await provider.getBalance(user.ethAddress);
       realBalance = parseFloat(ethers.formatEther(balanceBigInt));
       currencySymbol = networkId === 'bep20' ? 'BNB' : 'ETH';
    }

    // B. SOLANA
    else if (networkId === 'sol' || networkId === 'spl') {
       if (!user.solAddress || user.solAddress.includes("Fallback")) return NextResponse.json({ newDeposit: false });
       const balanceLamports = await providers.sol.getBalance(new PublicKey(user.solAddress));
       realBalance = balanceLamports / 1000000000; 
       currencySymbol = 'SOL';
    }

    // C. BITCOIN
    else if (networkId === 'btc') {
       if (!user.btcAddress || user.btcAddress.includes("Fallback")) return NextResponse.json({ newDeposit: false });
       try {
         const response = await fetch(`https://blockchain.info/q/addressbalance/${user.btcAddress}`);
         const balanceSatoshi = await response.text();
         realBalance = parseInt(balanceSatoshi) / 100000000;
         currencySymbol = 'BTC';
       } catch (err) { return NextResponse.json({ newDeposit: false }); }
    }

    // --- 3. COMPARE WITH DATABASE ---
    const price = await getPrice(currencySymbol);
    const usdValue = realBalance * price;

    // ✅ FIXED: Lowered dust filter from 0.50 to 0.01
    if (usdValue < 0.01) {
        return NextResponse.json({ newDeposit: false, message: "Below dust threshold" });
    }

    // Calculate how much we already credited
    const totalUSDCredited = user.transactions
      .filter(t => t.status === 'APPROVED' && t.method === networkId.toUpperCase())
      .reduce((sum, t) => sum + t.amount, 0);

    const estimatedCryptoCredited = totalUSDCredited / price;
    const newCryptoFound = realBalance - estimatedCryptoCredited;
    
    // Allow for tiny tiny differences
    if (newCryptoFound > 0.000001) {
        
        const newUSDAmount = newCryptoFound * price;

        // ✅ FIXED: Lowered limit from 0.50 to 0.01
        if (newUSDAmount < 0.01) return NextResponse.json({ newDeposit: false });

        // UPDATE DB
        await prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: newUSDAmount } }
        });

        await prisma.transaction.create({
            data: {
                amount: newUSDAmount,
                type: 'DEPOSIT',
                status: 'APPROVED',
                method: networkId.toUpperCase(),
                userId: user.id
            }
        });

        return NextResponse.json({ newDeposit: true, amount: newUSDAmount }, { status: 200 });
    }

    return NextResponse.json({ newDeposit: false }, { status: 200 });

  } catch (error) {
    console.error("Auto-Check Failed:", error);
    return NextResponse.json({ message: 'Check failed' }, { status: 500 });
  }
}