/** @jsxImportSource frog/jsx */
import { Frog, Button } from 'frog'
import { abi } from './abi.js'

// 1. App Configuration & Constants
const VIBE_CHECK_SPLITTER_ADDRESS = '0x83E6416AF7600EE626DAb6D636207D6B76326c2C'
const MERCHANT_ADDRESS = '0x9484170BB453162e8B2a20d86259fAb2c8E185A8'
const PRODUCT_ID = 1
const PRODUCT_PRICE_WEI = '10000000000000000' // 0.01 ETH
const DOMAIN = 'https://vibecheck-app.vercel.app'

// 2. Initialize Frog App
export const app = new Frog({
  basePath: '/api',
  title: 'VibeCheck',
})

// --- Initial Landing Frame ---
app.frame('/', (c) => {
  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%)',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🕶️</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>VibeCheck</div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)' }}>
          Discover & Curate the Best on Base
        </div>
      </div>
    ),
    intents: [
      <Button action="/vibe/0x0000000000000000000000000000000000000000">
        🛍️ Explore Products
      </Button>,
      <Button action="/leaderboard">🏆 Leaderboard</Button>,
    ],
  })
})

// --- Product / Influencer Frame ---
app.frame('/vibe/:influencerAddress', (c) => {
  const influencer = c.req.param('influencerAddress') || '0x0000000000000000000000000000000000000000'
  const shortAddr = `${influencer.slice(0, 6)}...${influencer.slice(-4)}`

  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #12121a 0%, #222230 100%)',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ fontSize: 60, marginBottom: 16 }}>👟</div>
        <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 12 }}>
          Premium Sneakers
        </div>
        <div
          style={{
            display: 'flex',
            padding: '8px 24px',
            background: 'linear-gradient(135deg, #00d4aa, #00b4d8)',
            borderRadius: 20,
            fontSize: 20,
            color: '#000',
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Curated by: {shortAddr}
        </div>
        <div style={{ fontSize: 36, fontWeight: 700 }}>0.01 ETH</div>
      </div>
    ),
    intents: [
      <Button.Transaction target={`/tx/buy?ref=${influencer}`}>
        💳 Buy Now
      </Button.Transaction>,
      <Button action="/">← Back</Button>,
    ],
  })
})

// --- On-Chain Transaction ---
app.transaction('/tx/buy', (c) => {
  const ref = (c.req.query('ref') || '0x0000000000000000000000000000000000000000') as `0x${string}`

  return c.contract({
    abi,
    to: VIBE_CHECK_SPLITTER_ADDRESS,
    functionName: 'buyVibe',
    args: [ref, MERCHANT_ADDRESS, BigInt(PRODUCT_ID)],
    value: BigInt(PRODUCT_PRICE_WEI),
    chainId: 'eip155:8453', // Base Mainnet
  })
})

// --- Success Frame ---
app.frame('/success', (c) => {
  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #004411 0%, #006622 100%)',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🚀</div>
        <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 12 }}>
          Vibe Confirmed!
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }}>
          Your Aura Score has been boosted
        </div>
      </div>
    ),
    intents: [
      <Button.Link href={`https://warpcast.com/~/compose?text=I%20just%20checked%20my%20vibe%20on%20Base!&embeds[]=${DOMAIN}/api`}>
        📢 Share on Warpcast
      </Button.Link>,
      <Button action="/">🏠 Home</Button>,
    ],
  })
})

// --- Leaderboard Frame ---
app.frame('/leaderboard', (c) => {
  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a24 0%, #2a2a34 100%)',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ fontSize: 60, marginBottom: 16 }}>🏆</div>
        <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 24 }}>
          Top Curators
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', fontSize: 24, gap: 12 }}>
            <span>🥇</span>
            <span>0x1234...5678</span>
            <span style={{ color: '#00d4aa' }}>+2.5 ETH</span>
          </div>
          <div style={{ display: 'flex', fontSize: 24, gap: 12 }}>
            <span>🥈</span>
            <span>0xabcd...efgh</span>
            <span style={{ color: '#00d4aa' }}>+1.8 ETH</span>
          </div>
          <div style={{ display: 'flex', fontSize: 24, gap: 12 }}>
            <span>🥉</span>
            <span>0x9876...4321</span>
            <span style={{ color: '#00d4aa' }}>+1.2 ETH</span>
          </div>
        </div>
      </div>
    ),
    intents: [
      <Button action="/">← Back Home</Button>,
    ],
  })
})

// Vercel Serverless Function Handler
import { handle } from 'hono/vercel'
export const GET = handle(app)
export const POST = handle(app)
