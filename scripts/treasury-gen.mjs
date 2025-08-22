#!/usr/bin/env node

import fs from "node:fs";
import path from "path";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "..", ".env.local");

const kp = Keypair.generate();
const secretB58 = bs58.encode(kp.secretKey);
const pubkey = kp.publicKey.toBase58();

let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const line = `VITE_TREASURY_SECRET="${secretB58}"`;

if (/^VITE_TREASURY_SECRET\s*=.*$/m.test(env)) {
  env = env.replace(/^VITE_TREASURY_SECRET\s*=.*$/m, line);
} else {
  env += (env.endsWith("\n") ? "" : "\n") + line + "\n";
}

fs.writeFileSync(envPath, env, "utf8");

console.log("✅ Treasury key generated & saved to .env.local");
console.log("   Public Key:", pubkey);
console.log("   (Send devnet SOL here for the demo)");

