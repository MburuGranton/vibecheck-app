import { Frog, Button, getFarcasterUserData } from 'frog'
import { abi } from './abi'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

// Placeholder addresses - replace with actual deployed contract and merchant addresses
const VIBE_CHECK_SPLITTER_ADDRESS = '0x83E6416AF7600EE626DAb6D636207D6B76326c2C' // Deploy VibeSplitter.sol and update
const MERCHANT_ADDRESS = '0x9484170BB453162e8B2a20d86259fAb2c8E185A8' // Update with actual merchant address
const PRODUCT_ID = 1
const PRODUCT_PRICE_WEI = '10000000000000000' // 0.01 ETH in wei
const DOMAIN = 'https://vibecheck.xyz' // Update with your actual domain

const publicClient = createPublicClient({
  chain: base,
  transport: http()
})

const app = new Frog({
  title: 'VibeCheck',
})

app.use(getFarcasterUserData())

function generateSVG(influencer: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#f0f0f0"/>
    <text x="50" y="50" font-family="Arial" font-size="24" fill="#000">Product: Awesome Item</text>
    <text x="50" y="100" font-family="Arial" font-size="18" fill="#000">Curated by ${influencer}</text>
    <text x="50" y="150" font-family="Arial" font-size="16" fill="#000">Price: 0.01 ETH</text>
  </svg>`
}

app.frame('/', (c) => {
  return c.res({
    image: 'Welcome to VibeCheck! Discover and share products on Farcaster.',
    intents: [
      <Button action="/vibe/0x0000000000000000000000000000000000000000">Explore Products</Button>,
    ]
  })
})

app.frame('/vibe/:influencerAddress', async (c) => {
  const influencer = c.req.param('influencerAddress')
  const svg = generateSVG(influencer)

  return c.res({
    image: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
    intents: [
      <Button.Transaction action={`/tx/buy?ref=${influencer}`}>Buy with 1-Tap</Button.Transaction>,
      <Button action="/leaderboard">Leaderboard</Button>,
    ]
  })
})

app.transaction('/tx/buy', async (c) => {
  const ref = c.req.query('ref')

  return c.contract({
    abi,
    to: VIBE_CHECK_SPLITTER_ADDRESS,
    functionName: 'buyVibe',
    args: [ref, MERCHANT_ADDRESS, PRODUCT_ID],
    value: PRODUCT_PRICE_WEI,
    successAction: '/success',
    capabilities: {
      paymasterService: {
        url: process.env.PAYMASTER_URL
      }
    }
  })
})

app.frame('/success', async (c) => {
  const { address } = c.var.farcasterUserData

  const balance = await publicClient.readContract({
    address: VIBE_CHECK_SPLITTER_ADDRESS,
    abi,
    functionName: 'balanceOf',
    args: [address]
  })

  const score = Number(balance) * 10

  return c.res({
    image: `Transaction Confirmed! Your Aura Score: ${score}`,
    intents: [
      <Button.Link href={`https://warpcast.com/~/compose?text=Check%20out%20my%20vibe!&embeds[]=${DOMAIN}/vibe/${address}`}>Share to Boost Aura</Button.Link>,
    ]
  })
})

app.frame('/leaderboard', (c) => {
  return c.res({
    image: 'Leaderboard - Coming Soon!', // Placeholder
    intents: [
      <Button action="/vibe/0x0000000000000000000000000000000000000000">Home</Button>, // Placeholder home
    ]
  })
})

export default app
