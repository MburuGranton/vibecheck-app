import { Frog, Button, getFarcasterUserData, TextInput } from 'frog'
import { handle } from 'frog/vercel'
import { abi } from './abi.js'
import { createPublicClient, http, parseUnits } from 'viem'
import { base } from 'viem/chains'

// 1. App Configuration & Constants
const VIBE_CHECK_SPLITTER_ADDRESS = '0x83E6416AF7600EE626DAb6D636207D6B76326c2C'
const MERCHANT_ADDRESS = '0x9484170BB453162e8B2a20d86259fAb2c8E185A8'
const PRODUCT_ID = 1
const PRODUCT_PRICE_WEI = '10000000000000000' // 0.01 ETH
const DOMAIN = 'https://vibecheck-app.vercel.app' // Update with your actual Vercel URL

const publicClient = createPublicClient({
  chain: base,
  transport: http()
})

// 2. Initialize Frog
export const app = new Frog({
  basePath: '/api',
  title: 'VibeCheck',
  hubApiUrl: 'https://api.hub.neynar.com:2281', // Required for verifying user data
})

app.use(getFarcasterUserData())

// 3. Frame Routes
// --- Initial Landing Frame ---
app.frame('/', (c) => {
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60, background: 'black', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h1 style={{ fontSize: 80, marginBottom: 20 }}>VibeCheck 🕶️</h1>
        <p style={{ fontSize: 30 }}>Discover & Curate the Best on Base</p>
      </div>
    ),
    intents: [
      <Button action="/vibe/0x0000000000000000000000000000000000000000">Explore Products</Button>,
    ]
  })
})

// --- Influencer / Product Frame ---
app.frame('/vibe/:influencerAddress', (c) => {
  const influencer = c.req.param('influencerAddress')
  const shortAddr = `${influencer.slice(0, 6)}...${influencer.slice(-4)}`
  
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', flexDirection: 'column', background: 'linear-gradient(to bottom, #111, #333)', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ fontSize: 50, marginBottom: 10 }}>Awesome Item #1</h2>
        <div style={{ display: 'flex', padding: '10px 20px', backgroundColor: '#00ffcc', color: 'black', borderRadius: '10px', fontSize: 25, marginBottom: 10 }}>
          Curated by: {shortAddr}
        </div>
        <p style={{ fontSize: 35 }}>Price: 0.01 ETH</p>
      </div>
    ),
    intents: [
      <Button.Transaction target={`/tx/buy?ref=${influencer}`}>Buy with 1-Tap</Button.Transaction>,
      <Button action="/leaderboard">Leaderboard</Button>,
    ]
  })
})

// --- On-Chain Transaction Logic ---
app.transaction('/tx/buy', (c) => {
  const ref = c.req.query('ref') as `0x${string}`

  return c.contract({
    abi,
    to: VIBE_CHECK_SPLITTER_ADDRESS,
    functionName: 'buyVibe',
    args: [ref, MERCHANT_ADDRESS, PRODUCT_ID],
    value: BigInt(PRODUCT_PRICE_WEI),
    chainId: 'eip155:8453', // Base Mainnet
  })
})

// --- Success / Post-Transaction Frame ---
app.frame('/success', async (c) => {
  const { farcasterUserData } = c.var
  const userAddress = farcasterUserData?.address || '0x...'
  
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 40, background: '#004411', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h1>Vibe Confirmed! 🚀</h1>
        <p>Aura Score Boosted</p>
      </div>
    ),
    intents: [
      <Button.Link href={`https://warpcast.com/~/compose?text=I%20just%20checked%20my%20vibe%20on%20Base!&embeds[]=${DOMAIN}/api/vibe/${userAddress}`}>Share Vibe</Button.Link>,
    ]
  })
})

// --- Leaderboard ---
app.frame('/leaderboard', (c) => {
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 50, background: '#111', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        Leaderboard - Coming Soon! 🏆
      </div>
    ),
    intents: [
      <Button action="/">Back Home</Button>,
    ]
  })
})

// 4. Vercel Serverless Handlers
export const GET = handle(app)
export const POST = handle(app)