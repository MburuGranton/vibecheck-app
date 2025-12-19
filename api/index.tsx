import { Frog, Button, getFarcasterUserData } from 'frog'
import { handle } from 'frog/vercel'
import { abi } from './abi.js'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

// 1. Configuration Constants
const VIBE_CHECK_SPLITTER_ADDRESS = '0x83E6416AF7600EE626DAb6D636207D6B76326c2C'
const MERCHANT_ADDRESS = '0x9484170BB453162e8B2a20d86259fAb2c8E185A8'
const PRODUCT_ID = 1
const PRODUCT_PRICE_WEI = '10000000000000000' // 0.01 ETH
const DOMAIN = 'https://vibecheck-app.vercel.app' // UPDATE THIS to your actual Vercel URL

const publicClient = createPublicClient({
  chain: base,
  transport: http()
})

// 2. Initialize Frog App
// The 'basePath' is essential for Vercel functions to route correctly
export const app = new Frog({
  basePath: '/api',
  title: 'VibeCheck',
  hubApiUrl: 'https://api.hub.neynar.com:2281', // Needed for trusted Farcaster data
})

app.use(getFarcasterUserData())

// 3. Helper for Dynamic Visuals
function generateSVG(influencer: string) {
  const shortAddr = `${influencer.slice(0, 6)}...${influencer.slice(-4)}`
  return (
    <div style={{ 
      color: 'white', 
      display: 'flex', 
      flexDirection: 'column',
      fontSize: 40, 
      background: 'linear-gradient(to right, #000, #434343)', 
      width: '100%', 
      height: '100%', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <h1 style={{ fontSize: 60 }}>VibeCheck 🕶️</h1>
      <p>Product: Awesome Item #1</p>
      <p style={{ color: '#00ffcc' }}>Curated by: {shortAddr}</p>
      <p>Price: 0.01 ETH</p>
    </div>
  )
}

// 4. Routes & Logic
app.frame('/', (c) => {
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 50, background: 'black', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        Welcome to VibeCheck! 🕶️
      </div>
    ),
    intents: [
      <Button action="/vibe/0x0000000000000000000000000000000000000000">Explore Products</Button>,
    ]
  })
})

app.frame('/vibe/:influencerAddress', (c) => {
  const influencer = c.req.param('influencerAddress')
  return c.res({
    image: generateSVG(influencer),
    intents: [
      <Button.Transaction target={`/tx/buy?ref=${influencer}`}>Buy with 1-Tap</Button.Transaction>,
      <Button action="/leaderboard">Leaderboard</Button>,
    ]
  })
})

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

app.frame('/leaderboard', (c) => {
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 40, background: '#111', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        Leaderboard - Coming Soon! 🏆
      </div>
    ),
    intents: [
      <Button action="/">Home</Button>,
    ]
  })
})

// 5. Vercel Exports
export const GET = handle(app)
export const POST = handle(app)