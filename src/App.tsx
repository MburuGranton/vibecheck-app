import React, { useState, useEffect, useCallback } from 'react';

// Note: CSS is loaded via index.html from the public folder

// ================== Constants ==================
const CONTRACT_ADDRESS = '0x83E6416AF7600EE626DAb6D636207D6B76326c2C';
const BASESCAN_URL = 'https://basescan.org';

// ================== Types ==================
type View = 'home' | 'vibe' | 'success' | 'leaderboard' | 'profile' | 'activity' | 'featured' | 'trending' | 'new' | 'transactions';

interface Product {
  id: number;
  title: string;
  description: string;
  priceEth: string;
  influencer: string;
  image: string;
  badge: string;
  category: string;
  sales: number;
  earnings: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  launchDate?: string;
  trendingRank?: number;
}

interface Transaction {
  id: string;
  hash: string;
  type: 'buy' | 'referral' | 'mint';
  status: 'confirmed' | 'pending' | 'failed';
  amount: string;
  timestamp: string;
  from: string;
  to: string;
  productId?: number;
  blockNumber: number;
  gasUsed: string;
}

interface LeaderboardEntry {
  rank: number;
  address: string;
  username: string;
  avatar: string;
  sales: number;
  earnings: string;
  badge?: string;
}

interface Activity {
  id: number;
  type: 'purchase' | 'referral' | 'reward';
  title: string;
  description: string;
  amount: string;
  timestamp: string;
  icon: string;
}

interface UserStats {
  totalEarnings: string;
  totalSales: number;
  rank: number;
  auraScore: number;
  nftsOwned: number;
  referrals: number;
}

// ================== Mock Data ==================
const PRODUCTS: Product[] = [
  // Featured Products
  {
    id: 1,
    title: 'Genesis Vibe Collection',
    description: 'Exclusive digital collectible from the Genesis collection. Own a piece of the vibe and earn 7% on every referral.',
    priceEth: '0.01',
    influencer: '0x1234567890abcdef1234567890abcdef12345678',
    image: '✨',
    badge: 'Featured',
    category: 'Collectibles',
    sales: 247,
    earnings: '1.73',
    isFeatured: true,
    isTrending: true,
  },
  {
    id: 2,
    title: 'Cosmic Aura Pass',
    description: 'Unlock exclusive access to premium drops and early minting privileges. Limited to 1000 holders.',
    priceEth: '0.025',
    influencer: '0xabcdef1234567890abcdef1234567890abcdef12',
    image: '🌌',
    badge: 'Limited',
    category: 'Access Pass',
    sales: 89,
    earnings: '0.62',
    isFeatured: true,
  },
  {
    id: 3,
    title: 'Neon Dreams Badge',
    description: 'Show off your status with this animated profile badge. Verified holder benefits included.',
    priceEth: '0.005',
    influencer: '0x9876543210fedcba9876543210fedcba98765432',
    image: '🎭',
    badge: 'Hot',
    category: 'Badges',
    sales: 512,
    earnings: '0.18',
    isTrending: true,
    trendingRank: 1,
  },
  {
    id: 4,
    title: 'Base Builder Kit',
    description: 'Everything you need to start building on Base. Includes tutorials, templates, and community access.',
    priceEth: '0.015',
    influencer: '0xfedcba9876543210fedcba9876543210fedcba98',
    image: '🛠️',
    badge: 'New',
    category: 'Tools',
    sales: 156,
    earnings: '0.33',
    isNew: true,
    launchDate: '2025-12-20',
  },
  // Trending Products
  {
    id: 5,
    title: 'Vibe Lords NFT',
    description: 'Join the elite Vibe Lords community. Exclusive perks, airdrops, and governance rights.',
    priceEth: '0.05',
    influencer: '0x1111222233334444555566667777888899990000',
    image: '👑',
    badge: 'Trending',
    category: 'Membership',
    sales: 892,
    earnings: '3.12',
    isTrending: true,
    trendingRank: 2,
  },
  {
    id: 6,
    title: 'Pixel Punks Remix',
    description: 'A fresh take on the classic pixel art style. Each piece is uniquely generated.',
    priceEth: '0.008',
    influencer: '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555',
    image: '🎨',
    badge: 'Hot',
    category: 'Art',
    sales: 1247,
    earnings: '0.70',
    isTrending: true,
    trendingRank: 3,
  },
  {
    id: 7,
    title: 'DeFi Mastery Course',
    description: 'Learn DeFi from scratch. 20+ hours of content from top traders and developers.',
    priceEth: '0.02',
    influencer: '0x5555666677778888999900001111222233334444',
    image: '📚',
    badge: 'Trending',
    category: 'Education',
    sales: 445,
    earnings: '0.62',
    isTrending: true,
    trendingRank: 4,
  },
  // New Products
  {
    id: 8,
    title: 'Metaverse Land Deed',
    description: 'Own virtual real estate in the VibeVerse. Build, rent, or flip your property.',
    priceEth: '0.1',
    influencer: '0xbbbbccccddddeeee1111222233334444555566667',
    image: '🏠',
    badge: 'New',
    category: 'Virtual Land',
    sales: 23,
    earnings: '0.16',
    isNew: true,
    launchDate: '2025-12-22',
  },
  {
    id: 9,
    title: 'AI Art Generator Pass',
    description: 'Unlimited access to our AI art generation tools. Create unique NFTs instantly.',
    priceEth: '0.03',
    influencer: '0xccccddddeeee11112222333344445555666677778',
    image: '🤖',
    badge: 'Just Launched',
    category: 'Tools',
    sales: 67,
    earnings: '0.14',
    isNew: true,
    launchDate: '2025-12-21',
  },
  {
    id: 10,
    title: 'Sound Wave Collection',
    description: 'Music NFTs from emerging artists. Own the sound, share the royalties.',
    priceEth: '0.012',
    influencer: '0xddddeeee111122223333444455556666777788889',
    image: '🎵',
    badge: 'New',
    category: 'Music',
    sales: 189,
    earnings: '0.16',
    isNew: true,
    launchDate: '2025-12-19',
  },
  {
    id: 11,
    title: 'Gaming Guild Token',
    description: 'Access exclusive gaming tournaments and earn rewards. Powered by Base.',
    priceEth: '0.007',
    influencer: '0xeeee11112222333344445555666677778888999900',
    image: '🎮',
    badge: 'Fresh',
    category: 'Gaming',
    sales: 334,
    earnings: '0.16',
    isNew: true,
    launchDate: '2025-12-18',
  },
  {
    id: 12,
    title: 'Crypto Coffee Club',
    description: 'NFT membership for coffee lovers. Real-world perks at partner cafes worldwide.',
    priceEth: '0.018',
    influencer: '0x11112222333344445555666677778888999900001',
    image: '☕',
    badge: 'Featured',
    category: 'Lifestyle',
    sales: 567,
    earnings: '0.71',
    isFeatured: true,
    isTrending: true,
    trendingRank: 5,
  },
];

// Mock Transactions for BaseScan
const TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'buy',
    status: 'confirmed',
    amount: '0.01',
    timestamp: '2025-12-23T10:30:00Z',
    from: '0xDEADBEEF00000000000000000000000000000000',
    to: CONTRACT_ADDRESS,
    productId: 1,
    blockNumber: 23456789,
    gasUsed: '0.0003',
  },
  {
    id: '2',
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    type: 'referral',
    status: 'confirmed',
    amount: '0.0007',
    timestamp: '2025-12-23T09:15:00Z',
    from: CONTRACT_ADDRESS,
    to: '0xDEADBEEF00000000000000000000000000000000',
    blockNumber: 23456700,
    gasUsed: '0.0001',
  },
  {
    id: '3',
    hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    type: 'mint',
    status: 'confirmed',
    amount: '0',
    timestamp: '2025-12-23T10:30:05Z',
    from: '0x0000000000000000000000000000000000000000',
    to: '0xDEADBEEF00000000000000000000000000000000',
    productId: 1,
    blockNumber: 23456790,
    gasUsed: '0.0005',
  },
  {
    id: '4',
    hash: '0x5555666677778888999900001111222233334444555566667777888899990000',
    type: 'buy',
    status: 'confirmed',
    amount: '0.025',
    timestamp: '2025-12-22T18:45:00Z',
    from: '0xDEADBEEF00000000000000000000000000000000',
    to: CONTRACT_ADDRESS,
    productId: 2,
    blockNumber: 23450000,
    gasUsed: '0.0003',
  },
  {
    id: '5',
    hash: '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666777788889999aaaa',
    type: 'referral',
    status: 'pending',
    amount: '0.00175',
    timestamp: '2025-12-23T11:00:00Z',
    from: CONTRACT_ADDRESS,
    to: '0xDEADBEEF00000000000000000000000000000000',
    blockNumber: 23456800,
    gasUsed: '0.0001',
  },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, address: '0x1234...5678', username: 'vibemaster.eth', avatar: '👑', sales: 1247, earnings: '12.47', badge: 'Top Curator' },
  { rank: 2, address: '0xabcd...ef12', username: 'crypto_sage', avatar: '🔮', sales: 892, earnings: '8.92' },
  { rank: 3, address: '0x9876...4321', username: 'base_builder', avatar: '⚡', sales: 654, earnings: '6.54' },
  { rank: 4, address: '0xfedc...ba98', username: 'nft_queen', avatar: '💎', sales: 521, earnings: '5.21' },
  { rank: 5, address: '0x5678...1234', username: 'degen_dave', avatar: '🚀', sales: 423, earnings: '4.23' },
  { rank: 6, address: '0x2468...1357', username: 'web3_wizard', avatar: '🧙', sales: 389, earnings: '3.89' },
  { rank: 7, address: '0x1357...2468', username: 'alpha_hunter', avatar: '🎯', sales: 312, earnings: '3.12' },
  { rank: 8, address: '0x8642...9753', username: 'mint_master', avatar: '🎨', sales: 287, earnings: '2.87' },
];

const ACTIVITIES: Activity[] = [
  { id: 1, type: 'purchase', title: 'Purchased Genesis Vibe', description: 'You bought a collectible', amount: '-0.01 ETH', timestamp: '2 min ago', icon: '🛒' },
  { id: 2, type: 'referral', title: 'Referral Earned', description: 'crypto_sage used your link', amount: '+0.0007 ETH', timestamp: '15 min ago', icon: '🔗' },
  { id: 3, type: 'reward', title: 'Aura Bonus', description: 'Weekly top 10 reward', amount: '+50 Aura', timestamp: '1 hour ago', icon: '✨' },
  { id: 4, type: 'referral', title: 'Referral Earned', description: 'base_builder used your link', amount: '+0.0007 ETH', timestamp: '3 hours ago', icon: '🔗' },
  { id: 5, type: 'purchase', title: 'Purchased Cosmic Pass', description: 'You bought an access pass', amount: '-0.025 ETH', timestamp: '1 day ago', icon: '🛒' },
];

const USER_STATS: UserStats = {
  totalEarnings: '2.847',
  totalSales: 127,
  rank: 12,
  auraScore: 2450,
  nftsOwned: 8,
  referrals: 34,
};

// ================== Helper Functions ==================
const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
const shortenHash = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;
const formatNumber = (num: number) => num.toLocaleString();
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Filter helpers
const getFeaturedProducts = () => PRODUCTS.filter(p => p.isFeatured);
const getTrendingProducts = () => PRODUCTS.filter(p => p.isTrending).sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));
const getNewProducts = () => PRODUCTS.filter(p => p.isNew).sort((a, b) => new Date(b.launchDate || '').getTime() - new Date(a.launchDate || '').getTime());

// ================== Icons (Inline SVG Components) ==================
const Icons = {
  Wallet: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7M19 12H5" />
    </svg>
  ),
  Share: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
    </svg>
  ),
  Check: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Sparkles: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Trophy: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  ),
  Activity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Copy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  ),
  ExternalLink: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  TrendingUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  Gift: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Flame: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  Star: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Rocket: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  ),
  Box: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  RefreshCw: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  ),
  Filter: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
};

// ================== Main App Component ==================
const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [previousView, setPreviousView] = useState<View>('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [activeTab, setActiveTab] = useState<'featured' | 'trending' | 'new'>('featured');
  const [copied, setCopied] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'buy' | 'referral' | 'mint'>('all');
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const navigateTo = useCallback((newView: View) => {
    setPreviousView(view);
    setView(newView);
  }, [view]);

  const goBack = useCallback(() => {
    setView(previousView);
  }, [previousView]);

  const connectWallet = async () => {
    const provider: any = (window as any).ethereum;
    if (provider) {
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error('Failed to connect wallet:', err);
      }
    } else {
      setWalletAddress('0xDEADBEEF00000000000000000000000000000000');
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleBuy = async () => {
    if (!walletAddress) {
      await connectWallet();
      return;
    }
    
    setBuying(true);
    try {
      // Simulate transaction
      await new Promise((r) => setTimeout(r, 2000));
      // Set a mock transaction hash
      setLastTxHash('0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2));
      navigateTo('success');
    } catch (err) {
      console.error(err);
      alert('Transaction failed');
    } finally {
      setBuying(false);
    }
  };

  const openBaseScan = (hash: string, type: 'tx' | 'address' = 'tx') => {
    const url = type === 'tx' 
      ? `${BASESCAN_URL}/tx/${hash}`
      : `${BASESCAN_URL}/address/${hash}`;
    window.open(url, '_blank');
  };

  const getFilteredTransactions = () => {
    if (txFilter === 'all') return TRANSACTIONS;
    return TRANSACTIONS.filter(tx => tx.type === txFilter);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigateTo('vibe');
  };

  // ================== Render Components ==================

  const renderHeader = (showBack = false, title?: string) => (
    <header className="header fade-in">
      {showBack ? (
        <button className="btn-icon" onClick={goBack}>
          <Icons.ArrowLeft />
        </button>
      ) : (
        <div className="header-brand">
          <div className="header-logo glow-pulse">🕶️</div>
          <div>
            <h1 className="header-title">VibeCheck</h1>
            <p className="header-subtitle">Curated drops on Base</p>
          </div>
        </div>
      )}
      
      {title && (
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 className="header-title" style={{ fontSize: '1.125rem' }}>{title}</h1>
        </div>
      )}
      
      <div className="header-actions">
        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
          {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
        </button>
        <button className="wallet-btn" onClick={connectWallet}>
          <span className={`wallet-indicator ${walletAddress ? '' : 'disconnected'}`} />
          {walletAddress ? (
            <span className="wallet-address">{shortenAddress(walletAddress)}</span>
          ) : (
            <>
              <Icons.Wallet />
              <span>Connect</span>
            </>
          )}
        </button>
      </div>
    </header>
  );

  const renderBottomNav = () => (
    <nav className="bottom-nav">
      <button 
        className={`bottom-nav-item ${view === 'home' ? 'active' : ''}`} 
        onClick={() => navigateTo('home')}
      >
        <Icons.Home />
        <span>Home</span>
      </button>
      <button 
        className={`bottom-nav-item ${view === 'leaderboard' ? 'active' : ''}`} 
        onClick={() => navigateTo('leaderboard')}
      >
        <Icons.Trophy />
        <span>Ranks</span>
      </button>
      <button 
        className={`bottom-nav-item ${view === 'activity' ? 'active' : ''}`} 
        onClick={() => navigateTo('activity')}
      >
        <Icons.Activity />
        <span>Activity</span>
      </button>
      <button 
        className={`bottom-nav-item ${view === 'profile' ? 'active' : ''}`} 
        onClick={() => navigateTo('profile')}
      >
        <Icons.User />
        <span>Profile</span>
      </button>
    </nav>
  );

  const renderProductCard = (product: Product, featured = false) => (
    <div 
      key={product.id}
      className={`product-card hover-lift ${featured ? 'featured' : ''}`}
      onClick={() => selectProduct(product)}
    >
      {featured ? (
        <>
          <div className="product-image">
            <span style={{ fontSize: '4rem', position: 'relative', zIndex: 1 }} className="float">
              {product.image}
            </span>
          </div>
          <div className="product-content">
            <div className="product-badge">
              <span className="product-badge-dot" />
              {product.badge}
            </div>
            <h2 className="product-title">{product.title}</h2>
            <div className="product-curator">
              <div className="curator-avatar">V</div>
              <span className="curator-label">
                Curated by <span className="curator-address">{shortenAddress(product.influencer)}</span>
              </span>
            </div>
            <div className="product-meta">
              <div className="product-price">
                <span className="price-amount">{product.priceEth}</span>
                <span className="price-currency">ETH</span>
              </div>
              <div className="product-stats">
                <span className="stat-item">
                  <Icons.TrendingUp />
                  {formatNumber(product.sales)} sales
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="product-row">
          <div className="product-row-image">{product.image}</div>
          <div className="product-row-content">
            <div className="product-row-badge">{product.badge}</div>
            <h3 className="product-row-title">{product.title}</h3>
            <p className="product-row-category">{product.category}</p>
          </div>
          <div className="product-row-price">
            <span className="price-amount">{product.priceEth}</span>
            <span className="price-currency">ETH</span>
          </div>
          <Icons.ChevronRight />
        </div>
      )}
    </div>
  );

  // ================== Views ==================

  const renderHome = () => (
    <div className="view-container stagger-children">
      {renderHeader()}
      
      {/* Hero Stats */}
      {walletAddress && (
        <div className="stats-banner fade-in-up">
          <div className="stat-box">
            <span className="stat-value text-gradient">{USER_STATS.totalEarnings}</span>
            <span className="stat-label">ETH Earned</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-box">
            <span className="stat-value">{USER_STATS.auraScore}</span>
            <span className="stat-label">Aura Score</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-box">
            <span className="stat-value">#{USER_STATS.rank}</span>
            <span className="stat-label">Global Rank</span>
          </div>
        </div>
      )}

      {/* Category Tabs - Navigate to dedicated pages */}
      <div className="nav-pills">
        <button 
          className={`nav-pill ${activeTab === 'featured' ? 'active' : ''}`}
          onClick={() => { setActiveTab('featured'); navigateTo('featured'); }}
        >
          <Icons.Star />
          Featured
        </button>
        <button 
          className={`nav-pill ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => { setActiveTab('trending'); navigateTo('trending'); }}
        >
          <Icons.Flame />
          Trending
        </button>
        <button 
          className={`nav-pill ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => { setActiveTab('new'); navigateTo('new'); }}
        >
          <Icons.Rocket />
          New
        </button>
      </div>

      {/* Featured Product */}
      <div className="section-header">
        <span className="section-title">🔥 Featured Drop</span>
      </div>
      {renderProductCard(PRODUCTS[0], true)}

      {/* More Products */}
      <div className="section-header" style={{ marginTop: 'var(--spacing-xl)' }}>
        <span className="section-title">More Vibes</span>
        <button className="btn-ghost btn-sm" onClick={() => navigateTo('featured')}>View All</button>
      </div>
      <div className="product-list">
        {PRODUCTS.slice(1).map(product => renderProductCard(product))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-card" onClick={() => navigateTo('leaderboard')}>
          <div className="action-icon">🏆</div>
          <div className="action-content">
            <h4>Leaderboard</h4>
            <p>See top curators</p>
          </div>
          <Icons.ChevronRight />
        </button>
        <button className="action-card" onClick={() => navigateTo('transactions')}>
          <div className="action-icon">📊</div>
          <div className="action-content">
            <h4>Transactions</h4>
            <p>View on BaseScan</p>
          </div>
          <Icons.ChevronRight />
        </button>
        <button className="action-card" onClick={() => navigateTo('profile')}>
          <div className="action-icon">💰</div>
          <div className="action-content">
            <h4>Your Earnings</h4>
            <p>Track your revenue</p>
          </div>
          <Icons.ChevronRight />
        </button>
      </div>

      {renderBottomNav()}
    </div>
  );

  const renderVibe = () => (
    <div className="view-container fade-in-up">
      {renderHeader(true, 'Product Details')}

      <div className="product-detail-card">
        <div className="product-image large">
          <span style={{ fontSize: '5rem', position: 'relative', zIndex: 1 }} className="float">
            {selectedProduct.image}
          </span>
        </div>
        <div className="product-content">
          <div className="product-badge">
            <span className="product-badge-dot" />
            {selectedProduct.badge}
          </div>
          <h1 className="product-title" style={{ fontSize: '1.5rem' }}>{selectedProduct.title}</h1>
          <p className="product-description">{selectedProduct.description}</p>
          
          <div className="product-curator">
            <div className="curator-avatar">V</div>
            <span className="curator-label">
              Curated by <span className="curator-address">{shortenAddress(selectedProduct.influencer)}</span>
            </span>
          </div>
          
          <div className="divider" />

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Price</span>
              <div className="product-price" style={{ marginBottom: 0 }}>
                <span className="price-amount">{selectedProduct.priceEth}</span>
                <span className="price-currency">ETH</span>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-label">Your Earnings</span>
              <span className="detail-value accent">7% per sale</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Sales</span>
              <span className="detail-value">{formatNumber(selectedProduct.sales)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Curator Earnings</span>
              <span className="detail-value">{selectedProduct.earnings} ETH</span>
            </div>
          </div>

          <div className="divider" />

          {/* Benefits Section */}
          <div className="benefits-section">
            <h4 className="benefits-title">What you get</h4>
            <ul className="benefits-list">
              <li><span className="benefit-icon">✓</span> Exclusive NFT ownership</li>
              <li><span className="benefit-icon">✓</span> 7% on every referral sale</li>
              <li><span className="benefit-icon">✓</span> Access to holders-only channel</li>
              <li><span className="benefit-icon">✓</span> Early access to future drops</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bottom-bar">
        <div className="bottom-bar-content">
          <button className="btn btn-secondary btn-lg" style={{ flex: '0 0 auto' }}>
            <Icons.Share />
          </button>
          <button
            className="btn btn-primary btn-lg btn-block btn-ripple"
            onClick={handleBuy}
            disabled={buying}
          >
            {buying ? (
              <>
                <span className="spinner" />
                Processing...
              </>
            ) : (
              <>
                <Icons.Zap />
                Buy for {selectedProduct.priceEth} ETH
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="view-container success-view">
      <div className="success-container fade-in-scale">
        <div className="success-icon success-pop">
          <Icons.Check />
        </div>
        <h1 className="success-title">Vibe Confirmed! 🚀</h1>
        <p className="success-subtitle">
          You now own <strong>{selectedProduct.title}</strong>
        </p>

        <div className="success-card">
          <div className="success-nft">
            <span style={{ fontSize: '3rem' }}>{selectedProduct.image}</span>
          </div>
          <div className="success-details">
            <p className="success-detail-label">Transaction Complete</p>
            <p className="success-detail-value">-{selectedProduct.priceEth} ETH</p>
          </div>
        </div>

        {/* BaseScan Link */}
        {lastTxHash && (
          <button 
            className="basescan-link"
            onClick={() => openBaseScan(lastTxHash)}
          >
            <Icons.ExternalLink />
            <span>View on BaseScan</span>
            <code className="tx-hash">{shortenHash(lastTxHash)}</code>
          </button>
        )}

        <div className="aura-badge">
          <span className="aura-label">Aura Score</span>
          <span className="aura-value">+100 ✨</span>
        </div>

        {/* Referral Link */}
        <div className="referral-section">
          <h4>Share & Earn 7%</h4>
          <p className="referral-description">
            Earn 7% on every sale when someone buys using your link
          </p>
          <div className="referral-link-box">
            <code className="referral-link">
              {`vibecheck.xyz/vibe/${shortenAddress(walletAddress || '0x0000...0000')}`}
            </code>
            <button 
              className="btn-icon" 
              onClick={() => copyToClipboard(`${location.origin}/vibe/${walletAddress}`)}
            >
              {copied ? <Icons.Check /> : <Icons.Copy />}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="share-buttons">
          <a
            href={`https://warpcast.com/~/compose?text=I%20just%20got%20${encodeURIComponent(selectedProduct.title)}%20on%20VibeCheck!%20🕶️&embeds[]=${location.origin}/vibe/${walletAddress}`}
            target="_blank"
            rel="noreferrer"
            className="share-btn warpcast"
          >
            <span className="share-icon">🟣</span>
            Share on Warpcast
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=I%20just%20got%20${encodeURIComponent(selectedProduct.title)}%20on%20VibeCheck!%20🕶️&url=${location.origin}/vibe/${walletAddress}`}
            target="_blank"
            rel="noreferrer"
            className="share-btn twitter"
          >
            <span className="share-icon">𝕏</span>
            Share on X
          </a>
        </div>

        <button 
          className="btn btn-ghost btn-block mt-lg" 
          onClick={() => navigateTo('home')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="view-container stagger-children">
      {renderHeader(false)}
      
      <div className="page-header">
        <h1 className="page-title">
          <Icons.Trophy />
          Leaderboard
        </h1>
        <p className="page-subtitle">Top curators this week</p>
      </div>

      {/* Top 3 Podium */}
      <div className="podium">
        <div className="podium-item second">
          <div className="podium-avatar">{LEADERBOARD[1].avatar}</div>
          <span className="podium-rank">2</span>
          <span className="podium-name">{LEADERBOARD[1].username}</span>
          <span className="podium-earnings">{LEADERBOARD[1].earnings} ETH</span>
        </div>
        <div className="podium-item first">
          <div className="podium-crown">👑</div>
          <div className="podium-avatar gold">{LEADERBOARD[0].avatar}</div>
          <span className="podium-rank">1</span>
          <span className="podium-name">{LEADERBOARD[0].username}</span>
          <span className="podium-earnings">{LEADERBOARD[0].earnings} ETH</span>
        </div>
        <div className="podium-item third">
          <div className="podium-avatar">{LEADERBOARD[2].avatar}</div>
          <span className="podium-rank">3</span>
          <span className="podium-name">{LEADERBOARD[2].username}</span>
          <span className="podium-earnings">{LEADERBOARD[2].earnings} ETH</span>
        </div>
      </div>

      {/* Rest of Leaderboard */}
      <div className="leaderboard-list">
        {LEADERBOARD.slice(3).map((entry) => (
          <div key={entry.rank} className="leaderboard-item">
            <span className="leaderboard-rank">#{entry.rank}</span>
            <div className="leaderboard-avatar">{entry.avatar}</div>
            <div className="leaderboard-info">
              <span className="leaderboard-name">{entry.username}</span>
              <span className="leaderboard-stats">{formatNumber(entry.sales)} sales</span>
            </div>
            <div className="leaderboard-earnings">
              <span className="earnings-value">{entry.earnings}</span>
              <span className="earnings-label">ETH</span>
            </div>
          </div>
        ))}
      </div>

      {/* Your Position */}
      {walletAddress && (
        <div className="your-rank-card">
          <span className="your-rank-label">Your Position</span>
          <div className="your-rank-content">
            <span className="your-rank-number">#{USER_STATS.rank}</span>
            <div className="your-rank-stats">
              <span>{formatNumber(USER_STATS.totalSales)} sales</span>
              <span className="accent">{USER_STATS.totalEarnings} ETH</span>
            </div>
          </div>
        </div>
      )}

      {renderBottomNav()}
    </div>
  );

  const renderActivity = () => (
    <div className="view-container stagger-children">
      {renderHeader(false)}
      
      <div className="page-header">
        <h1 className="page-title">
          <Icons.Activity />
          Activity
        </h1>
        <p className="page-subtitle">Your recent transactions</p>
      </div>

      <div className="activity-list">
        {ACTIVITIES.map((activity) => (
          <div key={activity.id} className={`activity-item ${activity.type}`}>
            <div className="activity-icon">{activity.icon}</div>
            <div className="activity-content">
              <span className="activity-title">{activity.title}</span>
              <span className="activity-description">{activity.description}</span>
            </div>
            <div className="activity-meta">
              <span className={`activity-amount ${activity.amount.startsWith('+') ? 'positive' : 'negative'}`}>
                {activity.amount}
              </span>
              <span className="activity-time">{activity.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {renderBottomNav()}
    </div>
  );

  const renderProfile = () => (
    <div className="view-container stagger-children">
      {renderHeader(false)}
      
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          {walletAddress ? '🕶️' : '👤'}
        </div>
        <h2 className="profile-name">
          {walletAddress ? shortenAddress(walletAddress) : 'Not Connected'}
        </h2>
        {walletAddress && (
          <div className="profile-badges">
            <span className="profile-badge">Early Adopter</span>
            <span className="profile-badge accent">Top 15%</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <Icons.Wallet />
          <span className="profile-stat-value text-gradient">{USER_STATS.totalEarnings} ETH</span>
          <span className="profile-stat-label">Total Earnings</span>
        </div>
        <div className="profile-stat-card">
          <Icons.Trophy />
          <span className="profile-stat-value">#{USER_STATS.rank}</span>
          <span className="profile-stat-label">Global Rank</span>
        </div>
        <div className="profile-stat-card">
          <Icons.Sparkles />
          <span className="profile-stat-value">{formatNumber(USER_STATS.auraScore)}</span>
          <span className="profile-stat-label">Aura Score</span>
        </div>
        <div className="profile-stat-card">
          <Icons.Gift />
          <span className="profile-stat-value">{USER_STATS.referrals}</span>
          <span className="profile-stat-label">Referrals</span>
        </div>
      </div>

      {/* NFTs Owned */}
      <div className="section-header">
        <span className="section-title">Your Collection</span>
        <span className="section-count">{USER_STATS.nftsOwned} items</span>
      </div>
      <div className="nft-grid">
        {PRODUCTS.slice(0, 4).map((product) => (
          <div key={product.id} className="nft-item">
            <span className="nft-image">{product.image}</span>
            <span className="nft-name">{product.title.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="profile-links">
        <button className="profile-link" onClick={() => navigateTo('transactions')}>
          <Icons.FileText />
          <span>Transaction History</span>
          <Icons.ChevronRight />
        </button>
        <button className="profile-link">
          <Icons.Share />
          <span>Share Profile</span>
          <Icons.ChevronRight />
        </button>
        <button 
          className="profile-link"
          onClick={() => walletAddress && openBaseScan(walletAddress, 'address')}
        >
          <Icons.ExternalLink />
          <span>View on BaseScan</span>
          <Icons.ChevronRight />
        </button>
      </div>

      {renderBottomNav()}
    </div>
  );

  // ================== Featured Page ==================
  const renderFeatured = () => {
    const featuredProducts = getFeaturedProducts();
    return (
      <div className="view-container stagger-children">
        {renderHeader(true, 'Featured')}
        
        <div className="page-hero featured-hero">
          <div className="hero-icon">⭐</div>
          <h1 className="hero-title">Featured Drops</h1>
          <p className="hero-subtitle">Hand-picked by our curators. Premium quality guaranteed.</p>
        </div>

        <div className="stats-row">
          <div className="mini-stat">
            <span className="mini-stat-value">{featuredProducts.length}</span>
            <span className="mini-stat-label">Products</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-value">{featuredProducts.reduce((acc, p) => acc + p.sales, 0).toLocaleString()}</span>
            <span className="mini-stat-label">Total Sales</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-value">{featuredProducts.reduce((acc, p) => acc + parseFloat(p.earnings), 0).toFixed(2)}</span>
            <span className="mini-stat-label">ETH Volume</span>
          </div>
        </div>

        <div className="section-header">
          <span className="section-title">All Featured</span>
          <span className="section-count">{featuredProducts.length} items</span>
        </div>

        {/* Featured Hero Card */}
        {featuredProducts[0] && renderProductCard(featuredProducts[0], true)}

        {/* Rest of featured products */}
        <div className="product-list">
          {featuredProducts.slice(1).map(product => renderProductCard(product))}
        </div>

        {renderBottomNav()}
      </div>
    );
  };

  // ================== Trending Page ==================
  const renderTrending = () => {
    const trendingProducts = getTrendingProducts();
    return (
      <div className="view-container stagger-children">
        {renderHeader(true, 'Trending')}
        
        <div className="page-hero trending-hero">
          <div className="hero-icon">🔥</div>
          <h1 className="hero-title">Trending Now</h1>
          <p className="hero-subtitle">What the community is buying. Updated every hour.</p>
        </div>

        <div className="stats-row">
          <div className="mini-stat hot">
            <span className="mini-stat-value">+{Math.floor(Math.random() * 50 + 20)}%</span>
            <span className="mini-stat-label">24h Volume</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-value">{trendingProducts.reduce((acc, p) => acc + p.sales, 0).toLocaleString()}</span>
            <span className="mini-stat-label">Sales Today</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-value">{trendingProducts.length}</span>
            <span className="mini-stat-label">Hot Items</span>
          </div>
        </div>

        <div className="section-header">
          <span className="section-title">🔥 Hot Right Now</span>
        </div>

        {/* Trending list with rank badges */}
        <div className="trending-list">
          {trendingProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="trending-item hover-lift"
              onClick={() => selectProduct(product)}
            >
              <div className={`trending-rank rank-${index + 1}`}>
                {index + 1}
              </div>
              <div className="trending-image">{product.image}</div>
              <div className="trending-content">
                <h3 className="trending-title">{product.title}</h3>
                <p className="trending-category">{product.category}</p>
                <div className="trending-stats">
                  <span className="trending-sales">
                    <Icons.TrendingUp />
                    {formatNumber(product.sales)} sales
                  </span>
                </div>
              </div>
              <div className="trending-price">
                <span className="price-amount">{product.priceEth}</span>
                <span className="price-currency">ETH</span>
              </div>
            </div>
          ))}
        </div>

        {renderBottomNav()}
      </div>
    );
  };

  // ================== New Drops Page ==================
  const renderNew = () => {
    const newProducts = getNewProducts();
    return (
      <div className="view-container stagger-children">
        {renderHeader(true, 'New Drops')}
        
        <div className="page-hero new-hero">
          <div className="hero-icon">🚀</div>
          <h1 className="hero-title">New Drops</h1>
          <p className="hero-subtitle">Fresh releases. Be the first to collect.</p>
        </div>

        <div className="stats-row">
          <div className="mini-stat new">
            <span className="mini-stat-value">{newProducts.length}</span>
            <span className="mini-stat-label">This Week</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-value">24h</span>
            <span className="mini-stat-label">Avg Drop Time</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-value">7%</span>
            <span className="mini-stat-label">Curator Fee</span>
          </div>
        </div>

        <div className="section-header">
          <span className="section-title">🆕 Just Dropped</span>
        </div>

        {/* New products with launch dates */}
        <div className="new-drops-list">
          {newProducts.map((product) => (
            <div 
              key={product.id} 
              className="new-drop-card hover-lift"
              onClick={() => selectProduct(product)}
            >
              <div className="new-drop-header">
                <div className="new-badge">
                  <Icons.Clock />
                  {product.launchDate && formatDate(product.launchDate + 'T00:00:00Z')}
                </div>
                <div className="new-drop-badge">{product.badge}</div>
              </div>
              <div className="new-drop-image">{product.image}</div>
              <div className="new-drop-content">
                <h3 className="new-drop-title">{product.title}</h3>
                <p className="new-drop-desc">{product.description.slice(0, 80)}...</p>
                <div className="new-drop-footer">
                  <div className="new-drop-price">
                    <span className="price-amount">{product.priceEth}</span>
                    <span className="price-currency">ETH</span>
                  </div>
                  <div className="new-drop-sales">
                    {formatNumber(product.sales)} minted
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {renderBottomNav()}
      </div>
    );
  };

  // ================== Transactions Page (BaseScan) ==================
  const renderTransactions = () => {
    const filteredTx = getFilteredTransactions();
    const totalVolume = TRANSACTIONS.filter(tx => tx.type === 'buy').reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
    const totalEarned = TRANSACTIONS.filter(tx => tx.type === 'referral').reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
    
    return (
      <div className="view-container stagger-children">
        {renderHeader(true, 'Transactions')}
        
        <div className="page-hero tx-hero">
          <div className="hero-icon">📊</div>
          <h1 className="hero-title">Transaction History</h1>
          <p className="hero-subtitle">All your on-chain activity on Base</p>
        </div>

        {/* Contract Info Card */}
        <div className="contract-card">
          <div className="contract-header">
            <Icons.Box />
            <span>Smart Contract</span>
          </div>
          <div className="contract-address">
            <code>{shortenAddress(CONTRACT_ADDRESS)}</code>
            <button 
              className="btn-icon btn-sm"
              onClick={() => openBaseScan(CONTRACT_ADDRESS, 'address')}
            >
              <Icons.ExternalLink />
            </button>
          </div>
          <div className="contract-stats">
            <div className="contract-stat">
              <span className="contract-stat-value">{totalVolume.toFixed(3)}</span>
              <span className="contract-stat-label">ETH Spent</span>
            </div>
            <div className="contract-stat">
              <span className="contract-stat-value text-gradient">+{totalEarned.toFixed(4)}</span>
              <span className="contract-stat-label">ETH Earned</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="tx-filters">
          <button 
            className={`tx-filter ${txFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTxFilter('all')}
          >
            All
          </button>
          <button 
            className={`tx-filter ${txFilter === 'buy' ? 'active' : ''}`}
            onClick={() => setTxFilter('buy')}
          >
            Purchases
          </button>
          <button 
            className={`tx-filter ${txFilter === 'referral' ? 'active' : ''}`}
            onClick={() => setTxFilter('referral')}
          >
            Referrals
          </button>
          <button 
            className={`tx-filter ${txFilter === 'mint' ? 'active' : ''}`}
            onClick={() => setTxFilter('mint')}
          >
            Mints
          </button>
        </div>

        {/* Transaction List */}
        <div className="tx-list">
          {filteredTx.map((tx) => (
            <div 
              key={tx.id} 
              className={`tx-item ${tx.status}`}
              onClick={() => openBaseScan(tx.hash)}
            >
              <div className={`tx-type-icon ${tx.type}`}>
                {tx.type === 'buy' && '🛒'}
                {tx.type === 'referral' && '🔗'}
                {tx.type === 'mint' && '✨'}
              </div>
              <div className="tx-content">
                <div className="tx-header">
                  <span className="tx-title">
                    {tx.type === 'buy' && 'Purchase'}
                    {tx.type === 'referral' && 'Referral Reward'}
                    {tx.type === 'mint' && 'NFT Minted'}
                  </span>
                  <span className={`tx-status ${tx.status}`}>
                    {tx.status === 'confirmed' && '✓'}
                    {tx.status === 'pending' && '⏳'}
                    {tx.status === 'failed' && '✗'}
                  </span>
                </div>
                <div className="tx-hash">
                  <code>{shortenHash(tx.hash)}</code>
                  <Icons.ExternalLink />
                </div>
                <div className="tx-meta">
                  <span className="tx-time">
                    <Icons.Clock />
                    {formatDate(tx.timestamp)}
                  </span>
                  <span className="tx-block">Block #{tx.blockNumber.toLocaleString()}</span>
                </div>
              </div>
              <div className="tx-amount-col">
                <span className={`tx-amount ${tx.type === 'referral' ? 'positive' : tx.type === 'buy' ? 'negative' : ''}`}>
                  {tx.type === 'buy' && '-'}
                  {tx.type === 'referral' && '+'}
                  {tx.amount} ETH
                </span>
                <span className="tx-gas">Gas: {tx.gasUsed} ETH</span>
              </div>
            </div>
          ))}
        </div>

        {/* View All on BaseScan */}
        <button 
          className="btn btn-secondary btn-block mt-lg"
          onClick={() => walletAddress && openBaseScan(walletAddress, 'address')}
        >
          <Icons.ExternalLink />
          View All on BaseScan
        </button>

        {renderBottomNav()}
      </div>
    );
  };

  // ================== Main Render ==================
  return (
    <div className="app-container">
      {view === 'home' && renderHome()}
      {view === 'vibe' && renderVibe()}
      {view === 'success' && renderSuccess()}
      {view === 'leaderboard' && renderLeaderboard()}
      {view === 'activity' && renderActivity()}
      {view === 'profile' && renderProfile()}
      {view === 'featured' && renderFeatured()}
      {view === 'trending' && renderTrending()}
      {view === 'new' && renderNew()}
      {view === 'transactions' && renderTransactions()}
    </div>
  );
};

export default App;
