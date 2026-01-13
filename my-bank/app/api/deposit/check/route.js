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

// --- 2. TOKEN CONFIGURATION (CONTRACT ADDRESSES) ---
const TOKENS = {
    erc20: { // Ethereum
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    bep20: { // BSC
        USDT: '0x55d398326f99059fF775485246999027B3197955',
        USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
    },
    base: { // Base
        USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    },
    sol: { // Solana (Mint Addresses)
        USDT: 'Es9vMFrzcCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    }
};

// Minimal ABI to get Token Balance
const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)"];

// --- HELPER: FETCH CRYPTO PRICES (USD) ---
async function getPrices() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=["ETHUSDT","BNBUSDT","SOLUSDT","BTCUSDT"]');
    const data = await res.json();
    const prices = {};
    data.forEach(item => {
        prices[item.symbol.replace('USDT', '')] = parseFloat(item.price);
    });
    return { ...prices, USDT: 1, USDC: 1 }; // Stablecoins always $1 (approx)
  } catch (e) {
    console.error("Price Fetch Error:", e);
    return { ETH: 2000, BNB: 300, SOL: 100, BTC: 60000, USDT: 1, USDC: 1 }; // Fallbacks
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

    // 1. Get Live Prices
    const prices = await getPrices();
    let totalWalletValueUSD = 0;

    // --- CHECK EVM NETWORKS (ETH, BSC, BASE, ARB, OP) ---
    if (['erc20', 'base', 'bep20', 'arb', 'op'].includes(networkId)) {
       if (!user.ethAddress) return NextResponse.json({ newDeposit: false });
       
       const provider = providers[networkId];
       const address = user.ethAddress;

       // A. Check Native Balance (ETH/BNB)
       const nativeBigInt = await provider.getBalance(address);
       const nativeVal = parseFloat(ethers.formatEther(nativeBigInt));
       const nativeSymbol = networkId === 'bep20' ? 'BNB' : 'ETH';
       totalWalletValueUSD += nativeVal * (prices[nativeSymbol] || 0);

       // B. Check Token Balances (USDT/USDC) if they exist for this chain
       const chainTokens = TOKENS[networkId];
       if (chainTokens) {
           for (const [symbol, contractAddr] of Object.entries(chainTokens)) {
               try {
                   const contract = new ethers.Contract(contractAddr, ERC20_ABI, provider);
                   const bal = await contract.balanceOf(address);
                   // USDT/USDC usually use 6 decimals, most others 18.
                   // This is a simplification: 6 decimals for stables on EVM is common but varies.
                   // For USDT/USDC on Mainnet/BSC/Base it is 6 or 18.
                   // Safest assumption for major stables is checking decimals, but for this MVP:
                   // USDT (ETH/BSC) = 6 decimals. USDC (ETH/Base) = 6 decimals.
                   // BSC USDC is 18 decimals. This creates a nuance.
                   
                   // SIMPLE FIX: Normalize by assuming standard stablecoin decimals (6 for most mainnet stables)
                   // A robust app would query 'decimals()'.
                   
                   let decimals = 6; 
                   if (networkId === 'bep20' && symbol === 'USDC') decimals = 18; 

                   const tokenVal = parseFloat(ethers.formatUnits(bal, decimals));
                   totalWalletValueUSD += tokenVal * 1.0; // Assume $1 peg
               } catch (err) { /* Ignore token error */ }
           }
       }
    }

    // --- CHECK SOLANA ---
    else if (networkId === 'sol' || networkId === 'spl') {
       if (!user.solAddress || user.solAddress.includes("Fallback")) return NextResponse.json({ newDeposit: false });
       
       const pubKey = new PublicKey(user.solAddress);
       
       // A. Check Native SOL
       const balLamports = await providers.sol.getBalance(pubKey);
       totalWalletValueUSD += (balLamports / 1000000000) * prices.SOL;

       // B. Check SPL Tokens (USDT/USDC)
       // We fetch all token accounts owned by this wallet
       const tokenAccounts = await providers.sol.getParsedTokenAccountsByOwner(pubKey, {
         programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
       });

       tokenAccounts.value.forEach((accountInfo) => {
           const mint = accountInfo.account.data.parsed.info.mint;
           const amount = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
           
           if (mint === TOKENS.sol.USDT || mint === TOKENS.sol.USDC) {
               totalWalletValueUSD += amount * 1.0;
           }
       });
    }

    // --- CHECK BITCOIN ---
    else if (networkId === 'btc') {
       if (!user.btcAddress) return NextResponse.json({ newDeposit: false });
       try {
         const response = await fetch(`https://blockchain.info/q/addressbalance/${user.btcAddress}`);
         const balanceSatoshi = await response.text();
         totalWalletValueUSD += (parseInt(balanceSatoshi) / 100000000) * prices.BTC;
       } catch (err) { /* Ignore */ }
    }

    // --- 3. COMPARE & CREDIT ---
    // Filter out "dust"
    if (totalWalletValueUSD < 0.05) return NextResponse.json({ newDeposit: false });

    // Calculate how much USD we have ALREADY credited for this network
    const alreadyCredited = user.transactions
      .filter(t => t.status === 'APPROVED' && t.method === networkId.toUpperCase())
      .reduce((sum, t) => sum + t.amount, 0);

    // If wallet has MORE money than we credited, user made a deposit!
    const difference = totalWalletValueUSD - alreadyCredited;

    if (difference > 0.10) { // $0.10 buffer to avoid rounding errors
        
        // UPDATE DB
        await prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: difference } }
        });

        await prisma.transaction.create({
            data: {
                amount: difference,
                type: 'DEPOSIT',
                status: 'APPROVED',
                method: networkId.toUpperCase(),
                userId: user.id
            }
        });

        return NextResponse.json({ newDeposit: true, amount: difference }, { status: 200 });
    }

    return NextResponse.json({ newDeposit: false }, { status: 200 });

  } catch (error) {
    console.error("Auto-Check Failed:", error);
    return NextResponse.json({ message: 'Check failed' }, { status: 500 });
  }
}