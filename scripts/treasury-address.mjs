#!/usr/bin/env node

import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

const s = process.env.VITE_TREASURY_SECRET || "";
if (!s.trim()) {
  console.error("❌ VITE_TREASURY_SECRET is empty. Add it to .env.local");
  process.exit(1);
}

const kp = Keypair.fromSecretKey(bs58.decode(s.trim()));
console.log(kp.publicKey.toBase58());
