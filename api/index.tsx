import { Frog, Button, TextInput } from 'frog'
import { abi } from './abi.js'
import { createPublicClient, http, parseUnits } from 'viem'
import { base } from 'viem/chains'
import '../public/styles.css';
import '../public/animations.css';
import { useState } from 'react';
import { VercelRequest, VercelResponse } from '@vercel/node';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

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

// Updated middleware to match expected signature
import { MiddlewareHandler } from 'frog';

// Updated middleware to use a mutable object for context variables
const farcasterMiddleware: MiddlewareHandler = async (c, next) => {
  const mutableContext = { ...c.var };
  mutableContext.farcasterUserData = { address: '0x0000000000000000000000000000000000000000' }; // Example data
  Object.assign(c, { var: mutableContext });
  await next();
};

// Apply the middleware
app.use(farcasterMiddleware);

// --- Initial Landing Frame ---
app.frame('/', (c) => {
  return c.res({
    image: ReactDOMServer.renderToString(
      <div className="glass" style={{ color: 'white', display: 'flex', fontSize: 60, background: 'black', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h1 style={{ fontSize: 80, marginBottom: 20 }}>VibeCheck 🕶️</h1>
        <p style={{ fontSize: 30 }}>Discover & Curate the Best on Base</p>
        <Button action="/vibe/0x0000000000000000000000000000000000000000">Explore Products</Button>
      </div>
    ),
  })
})

// --- Influencer / Product Frame ---
app.frame('/vibe/:influencerAddress', (c) => {
  const influencer = c.req?.param('influencerAddress') || '0x0000000000000000000000000000000000000000';
  const shortAddr = `${influencer.slice(0, 6)}...${influencer.slice(-4)}`;

  return c.res({
    image: ReactDOMServer.renderToString(
      <div style={{ color: 'white', display: 'flex', flexDirection: 'column', background: 'linear-gradient(to bottom, #111, #333)', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ fontSize: 50, marginBottom: 10 }}>Awesome Item #1</h2>
        <div style={{ display: 'flex', padding: '10px 20px', backgroundColor: '#00ffcc', color: 'black', borderRadius: '10px', fontSize: 25, marginBottom: 10 }}>
          Curated by: {shortAddr}
        </div>
        <p style={{ fontSize: 35 }}>Price: 0.01 ETH</p>
      </div>
    ),
  });
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
  const farcasterUserData = (c.var as Record<string, any>).farcasterUserData || { address: '0x...' };
  const userAddress = farcasterUserData.address;

  return c.res({
    image: ReactDOMServer.renderToString(
      <div style={{ color: 'white', display: 'flex', fontSize: 40, background: '#004411', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h1>Vibe Confirmed! 🚀</h1>
        <p>Aura Score Boosted</p>
      </div>
    ),
    intents: [
      ReactDOMServer.renderToString(
        <a href={`https://warpcast.com/~/compose?text=I%20just%20checked%20my%20vibe%20on%20Base!&embeds[]=${DOMAIN}/api/vibe/${userAddress}`}>Share on Warpcast</a>
      ),
    ],
  });
})

// --- Leaderboard ---
app.frame('/leaderboard', (c) => {
  return c.res({
    image: ReactDOMServer.renderToString(
      <div style={{ color: 'white', textAlign: 'center' }}>Leaderboard - Coming Soon! 🏆</div>
    ),
    intents: [
      ReactDOMServer.renderToString(
        <a href="/">Back Home</a>
      ),
    ],
  });
})

// 4. Vercel Serverless Handlers
// Custom error handler
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return { message: 'An unknown error occurred' };
};

// Updated GET handler with improved error handling
export const GET = async (req: VercelRequest, res: VercelResponse) => {
  try {
    res.status(200).send({ message: 'GET request successful' });
  } catch (error) {
    const handledError = handleError(error);
    res.status(500).send({ error: 'Internal Server Error', details: handledError });
  }
};

// Updated POST handler with improved error handling
export const POST = async (req: VercelRequest, res: VercelResponse) => {
  try {
    res.status(200).send({ message: 'POST request successful' });
  } catch (error) {
    const handledError = handleError(error);
    res.status(500).send({ error: 'Internal Server Error', details: handledError });
  }
};

// Example usage of the glassmorphism container
const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.style.background = isDarkMode
      ? 'linear-gradient(135deg, #4A90E2, #50E3C2)'
      : '#1e1e1e';
    document.body.style.color = isDarkMode ? '#333' : '#fff';
  };

  return (
    <div className={`glass slide-in ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="fade-in">
        <h1>Welcome to VibeCheck</h1>
        <nav>
          <ul style={{ display: 'flex', justifyContent: 'space-around', listStyle: 'none', padding: 0 }}>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="features" className="fade-in">
          <h2>Features</h2>
          <p>Discover the cutting-edge features of VibeCheck.</p>
        </section>

        <section id="about" className="fade-in">
          <h2>About Us</h2>
          <p>Learn more about our mission and vision.</p>
        </section>

        <section id="contact" className="fade-in">
          <h2>Contact</h2>
          <p>Get in touch with us for more information.</p>
        </section>
      </main>

      <footer className="fade-in" style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={toggleTheme} style={{ marginBottom: '10px' }}>
          Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
        <p>&copy; 2025 VibeCheck. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;