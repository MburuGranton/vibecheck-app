1. Executive Summary
VibeCheck is a social commerce protocol for Farcaster on Base (L2). It enables 1-tap, in-feed shopping via Frames.

The Engine: A smart contract that splits payments (90% Merchant, 7% Influencer, 3% Platform) and mints an NFT receipt.

The Viral Loop: Every buyer gets a "Vibe-Receipt" NFT. Sharing this receipt creates a new referral link, making the buyer the new influencer.

2. Technical Stack
Network: Base Mainnet (ChainID: 8453).

Frontend/API: frog (Frog.fm framework) + hono.

Onchain Components: @coinbase/onchainkit for 1-tap transactions and Farcaster identity.

Contract Language: Solidity ^0.8.20 (OpenZeppelin standards).

Deployment: Vercel (Edge Functions).

3. Core Business Logic (The "3-Way Split")
All transactions must call the buyVibe function on the smart contract.

Input: address influencer, address merchant, uint256 productId.

Output: Transfer ETH/USDC to recipients; Mint ERC-721 "VIBE" token to msg.sender.

4. Frame State Flow & Referral Engine
Route: /vibe/:influencerAddress
Initial State: - Image: Dynamic SVG showing product and "Curated by [influencerAddress]".

Button 1: "Buy with 1-Tap" (Target: /tx/buy?ref=[influencerAddress]).

Button 2: "Leaderboard" (Target: /leaderboard).

Transaction Handler (/tx/buy):

Use onchainkit to return transaction metadata.

Target Contract: VIBE_CHECK_SPLITTER_ADDRESS.

Data: Encoded ABI call for buyVibe(influencerAddress, merchantAddress).

Success State (/success):

Image: "Transaction Confirmed! Your Aura Rank: [Score]".

Button 1: "Share My Vibe" (Link: warpcast.com/~/compose?text=Check out my vibe!&embeds[]=vibecheck.xyz/vibe/[buyerAddress]).

Logic: The buyer's address now becomes the influencerAddress in the referral link.

5. File Structure Reference
contracts/VibeSplitter.sol: Payment distribution + NFT minting.

api/index.tsx: Main Frog application, routing, and SVG image templates.

api/abi.ts: Exported ABI for the buyVibe function.

public/.well-known/farcaster.json: Farcaster Frame manifest (version: "1").

6. Security & Friction Constraints
Wallet: Must support Base Passkeys (Passkey-enabled smart wallets).

No Manual Inputs: Do not use fc:frame:input:text. Use trustedData from the Frame context to identify the user's fid and address.

Gas: Optimized for Base (<$0.01 per transactio)