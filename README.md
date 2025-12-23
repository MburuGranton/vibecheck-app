To a builder agent, VibeCheck is a Transactional Farcaster Frame that functions as a decentralized affiliate marketing engine on the Base network.

The app's logic is built on three pillars: Referral-based routing, Multi-party payment splitting, and On-chain status.

1. The Core Architecture
The app uses Frog.fm (Hono-based) as the backend and Viem for blockchain interactions. It follows a finite-state machine flow:

- Landing State (`/`): A static entry point that initiates the user session.

- Contextual State (`/vibe/:influencerAddress`): The app reads the `influencerAddress` from the URL parameter. This address is passed into the transaction logic as the referrer.

- Action State (`/tx/buy`): This is a Frame Transaction endpoint. It doesn't execute the trade; it returns a JSON object (following EIP-712) that tells the user's Farcaster wallet (Warpcast) exactly which smart contract function to call.

- Completion State (`/success`): A post-transaction "thank you" screen that allows the user to re-share the frame using their own address as the new referral link.

2. The Smart Contract Logic (The "Splitter")
The app interacts with the `buyVibe` function on your deployed contract.

Input: `(address referrer, address merchant, uint256 productId)`

Mechanism: The contract receives `0.01 ETH`. It immediately splits that value: a percentage goes to the merchant, a commission goes to the referrer (the influencer who shared the link), and a small fee remains with the protocol.

Validated Metric: By using a smart contract to handle the split rather than a backend database, you ensure instant, trustless payouts. Influencers don't have to "request a withdrawal"; they are paid the moment a sale happens.

3. Data Flow Diagram
The AI agent needs to understand that the "Source of Truth" shifts from the Frame URL to the Blockchain.

4. Technical Requirements for the Agent
To maintain this app, the agent must:

- Strictly use Base Mainnet (ChainID `eip155:8453`): Transactions will fail on other networks.

- Handle Dynamic Routing: Every user becomes a potential salesperson. The app must correctly append the `userAddress` to the URL in the "Share" button.

- Vercel Serverless Lifecycle: Since the app is hosted on Vercel, it must use `export const GET/POST` handlers to remain "awake" for Farcaster's POST requests.

---

Run the API (Frog) and the UI (Vite) in separate terminals during development:

API (Frog):

```bash
npm run dev         # starts frog dev (serves /api)
```

UI (Vite):

```bash
npm run dev:ui      # starts Vite dev server (serves /)
```
