import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import TronWeb from 'tronweb';

// Initialize Bitcoin generator
const bip32 = BIP32Factory(ecc);

export function generateWallet(index) {
  // 1. Get Master Mnemonic from .env
  const mnemonic = process.env.MASTER_MNEMONIC;
  if (!mnemonic) throw new Error("Missing MASTER_MNEMONIC in .env");

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  let ethAddress = "", btcAddress = "", solAddress = "", trxAddress = "";

  try {
    // --- A. ETHEREUM (and EVM Chains) ---
    const ethWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, `m/44'/60'/0'/0/${index}`);
    ethAddress = ethWallet.address;
  } catch (e) { console.error("ETH Error:", e); ethAddress = "0x0000000000000000000000000000000000000000"; }

  try {
    // --- B. BITCOIN (Native Segwit) ---
    const root = bip32.fromSeed(seed);
    const btcChild = root.derivePath(`m/84'/0'/0'/0/${index}`);
    const { address } = bitcoin.payments.p2wpkh({ 
      pubkey: btcChild.publicKey,
      network: bitcoin.networks.bitcoin 
    });
    btcAddress = address;
  } catch (e) { console.error("BTC Error:", e); btcAddress = "bc1qfallbackaddress..."; }

  try {
    // --- C. SOLANA ---
    const solDerivationPath = `m/44'/501'/${index}'/0'`;
    const derivedSeed = derivePath(solDerivationPath, seed.toString('hex')).key;
    const solKeypair = Keypair.fromSeed(derivedSeed);
    solAddress = solKeypair.publicKey.toBase58();
  } catch (e) { console.error("SOL Error:", e); solAddress = "SolanaFallbackAddress..."; }

  try {
    // --- D. TRON (The Tricky Part) ---
    // We derive the private key first
    const root = bip32.fromSeed(seed);
    const trxChild = root.derivePath(`m/44'/195'/0'/0/${index}`);
    const trxPrivateKey = trxChild.privateKey.toString('hex');

    // Attempt to use TronWeb instance
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
      headers: { "TRON-PRO-API-KEY": "dummy" },
      privateKey: '01'.repeat(32)
    });
    
    trxAddress = tronWeb.address.fromPrivateKey(trxPrivateKey);

  } catch (error) {
    // IF TRON FAILS, WE DO NOT CRASH. WE USE A STATIC ADDRESS.
    console.error("⚠️ Tron Generation Failed (Using Fallback):", error.message);
    trxAddress = "T9yD14Nj9j7xAB4dbGeiX9h8veHshenye"; // Your original static address
  }

  return { ethAddress, btcAddress, solAddress, trxAddress };
}
// ... existing imports and generateWallet function ...

// ✅ NEW: Function to reveal Private Keys (ADMIN ONLY)
export function getPrivateKeys(index) {
  const mnemonic = process.env.MASTER_MNEMONIC;
  if (!mnemonic) throw new Error("Missing MASTER_MNEMONIC");

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  let keys = {};

  try {
    // 1. ETH / BSC / BASE
    const ethWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, `m/44'/60'/0'/0/${index}`);
    keys.eth = ethWallet.privateKey;
  } catch (e) { keys.eth = "Error"; }

  try {
    // 2. BITCOIN (WIF)
    const root = bip32.fromSeed(seed);
    const btcChild = root.derivePath(`m/84'/0'/0'/0/${index}`);
    keys.btc = btcChild.toWIF();
  } catch (e) { keys.btc = "Error"; }

  try {
    // 3. SOLANA (Secret Key Array)
    const solDerivationPath = `m/44'/501'/${index}'/0'`;
    const derivedSeed = derivePath(solDerivationPath, seed.toString('hex')).key;
    const solKeypair = Keypair.fromSeed(derivedSeed);
    // Convert to standard [12, 234, ...] format or Base58
    keys.sol = `[${solKeypair.secretKey.toString()}]`; 
  } catch (e) { keys.sol = "Error"; }

  try {
    // 4. TRON
    const root = bip32.fromSeed(seed);
    const trxChild = root.derivePath(`m/44'/195'/0'/0/${index}`);
    keys.trx = trxChild.privateKey.toString('hex');
  } catch (e) { keys.trx = "Error"; }

  return keys;
}