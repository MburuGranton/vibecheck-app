// Minimal API handler to avoid build/typing issues during development.
// This file replaces the previous mixed server/client implementation.

import { Frog } from 'frog';

// Minimal Frog app export so `frog dev` can find and run the app.
export const app = new Frog({
  basePath: '/api',
  title: 'VibeCheck',
});

// Root frame
app.frame('/', (c) => {
  return c.res({
    image: `<div style=\"color:white;background:#000;width:100%;height:100%;display:flex;align-items:center;justify-content:center;\"><h1>VibeCheck</h1></div>`,
  });
});

// Simple product frame
app.frame('/vibe/:influencerAddress', (c) => {
  const influencer = c.req?.param('influencerAddress') || '0x0000000000000000000000000000000000000000';
  const shortAddr = `${influencer.slice(0, 6)}...${influencer.slice(-4)}`;

  return c.res({
    image: `<div style=\"color:white;padding:20px;\">Curated by: ${shortAddr}</div>`,
  });
});

// Transaction endpoint: returns an EIP-712-like JSON payload for the buyer's wallet
app.frame('/tx/buy', (c) => {
  // parse query params from raw URL to avoid depending on specific helpers
  const rawUrl = c.req?.url || '';
  const url = new URL(rawUrl, 'http://localhost');
  const ref = url.searchParams.get('ref') || '0x0000000000000000000000000000000000000000';
  const buyer = url.searchParams.get('buyer') || '0x0000000000000000000000000000000000000000';

  const domain = {
    name: 'VibeCheck',
    version: '1',
    chainId: 8453,
    verifyingContract: '0x83E6416AF7600EE626DAb6D636207D6B76326c2C',
  };

  const types = {
    BuyVibe: [
      { name: 'referrer', type: 'address' },
      { name: 'merchant', type: 'address' },
      { name: 'productId', type: 'uint256' },
    ],
  };

  const value = {
    referrer: ref,
    merchant: '0x9484170BB453162e8B2a20d86259fAb2c8E185A8',
    productId: 1,
  };

  const payload = { domain, types, value, primaryType: 'BuyVibe', from: buyer };

  // Return the payload embedded in a pre tag so frames remain compatible with Frog image frames.
  return c.res({
    image: `<pre>${JSON.stringify(payload)}</pre>`,
  });
});

// Success frame
app.frame('/success', (c) => {
  // allow query param ?user=0x... to build share link
  const rawUrl = c.req?.url || '';
  const url = new URL(rawUrl, 'http://localhost');
  const user = url.searchParams.get('user') || '';

  const shareUrl = user ? `${process.env.DOMAIN || 'http://localhost:3000'}/vibe/${user}` : '';

  return c.res({
    image: `<div style=\"color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;\"><h1>Vibe Confirmed! 🚀</h1><p>Aura Score Boosted</p>${shareUrl ? `<a href=\"https://warpcast.com/~/compose?text=I%20just%20checked%20my%20vibe%20on%20Base!&embeds[]=${encodeURIComponent(shareUrl)}\" target=\"_blank\">Share on Warpcast</a>` : ''}</div>`,
  });
});

