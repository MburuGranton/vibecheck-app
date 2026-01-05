import React, { useState, useEffect, useCallback } from 'react';

// Note: CSS is loaded via index.html from the public folder

// ================== Constants ==================
const CONTRACT_ADDRESS = '0x83E6416AF7600EE626DAb6D636207D6B76326c2C';
const BASESCAN_URL = 'https://basescan.org';

// ================== Types ==================
type View = 'home' | 'vibe' | 'success' | 'leaderboard' | 'profile' | 'transactions';

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
}

interface UserStats {
  totalEarnings: string;
  totalSales: number;
  rank: number;
  nftsOwned: number;
  referrals: number;
}

// ================== Mock Data ==================
const PRODUCTS: Product[] = [
  // Featured Products
  {
    id: 1,
    title: 'Genesis Collection #001',
    description: 'First edition from the Genesis series. Holders receive 7% of secondary sales.',
    priceEth: '0.008',
    influencer: '0x1234567890abcdef1234567890abcdef12345678',
    image: 'https://picsum.photos/seed/gen001/400/400',
    badge: 'Featured',
    category: 'Art',
    sales: 47,
    earnings: '0.26',
    isFeatured: true,
    isTrending: true,
  },
  {
    id: 2,
    title: 'Early Access Pass',
    description: 'Get notified 24h before public mints. Works for all drops in 2026.',
    priceEth: '0.02',
    influencer: '0xabcdef1234567890abcdef1234567890abcdef12',
    image: 'https://picsum.photos/seed/pass02/400/400',
    badge: '23 left',
    category: 'Pass',
    sales: 77,
    earnings: '1.08',
    isFeatured: true,
  },
  {
    id: 3,
    title: 'Verified Badge',
    description: 'Profile badge that shows on Warpcast. Non-transferable.',
    priceEth: '0.003',
    influencer: '0x9876543210fedcba9876543210fedcba98765432',
    image: 'https://picsum.photos/seed/badge03/400/400',
    badge: 'Popular',
    category: 'Badge',
    sales: 218,
    earnings: '0.46',
    isTrending: true,
    trendingRank: 1,
  },
  {
    id: 4,
    title: 'Dev Starter Pack',
    description: 'Boilerplate code + 3 months Discord access to builder community.',
    priceEth: '0.012',
    influencer: '0xfedcba9876543210fedcba9876543210fedcba98',
    image: 'https://picsum.photos/seed/dev04/400/400',
    badge: 'New',
    category: 'Tools',
    sales: 12,
    earnings: '0.10',
    isNew: true,
    launchDate: '2025-12-20',
  },
  // Trending Products
  {
    id: 5,
    title: 'Membership Card',
    description: 'Private Discord + weekly alpha calls. Cancel anytime.',
    priceEth: '0.035',
    influencer: '0x1111222233334444555566667777888899990000',
    image: 'https://picsum.photos/seed/member05/400/400',
    badge: 'Trending',
    category: 'Membership',
    sales: 89,
    earnings: '2.18',
    isTrending: true,
    trendingRank: 2,
  },
  {
    id: 6,
    title: 'Abstract #847',
    description: 'Generative art, 1/1. From the Abstract Objects collection.',
    priceEth: '0.042',
    influencer: '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555',
    image: 'https://picsum.photos/seed/art06/400/400',
    badge: '1/1',
    category: 'Art',
    sales: 1,
    earnings: '0.003',
    isTrending: true,
    trendingRank: 3,
  },
  {
    id: 7,
    title: 'Trading Basics Course',
    description: '12 video lessons + PDF workbook. Beginner friendly.',
    priceEth: '0.015',
    influencer: '0x5555666677778888999900001111222233334444',
    image: 'https://picsum.photos/seed/course07/400/400',
    badge: '4.8 ★',
    category: 'Education',
    sales: 31,
    earnings: '0.33',
    isTrending: true,
    trendingRank: 4,
  },
  // New Products
  {
    id: 8,
    title: 'Plot #2847',
    description: '10x10 parcel in District 4. Near main plaza.',
    priceEth: '0.085',
    influencer: '0xbbbbccccddddeeee1111222233334444555566667',
    image: 'https://picsum.photos/seed/land08/400/400',
    badge: 'New',
    category: 'Land',
    sales: 0,
    earnings: '0',
    isNew: true,
    launchDate: '2025-12-22',
  },
  {
    id: 9,
    title: 'Image Gen Credits',
    description: '500 credits for AI image generation. No expiry.',
    priceEth: '0.018',
    influencer: '0xccccddddeeee11112222333344445555666677778',
    image: 'https://picsum.photos/seed/credits09/400/400',
    badge: 'New',
    category: 'Credits',
    sales: 8,
    earnings: '0.01',
    isNew: true,
    launchDate: '2025-12-21',
  },
  {
    id: 10,
    title: 'Beat Pack Vol. 3',
    description: '15 royalty-free loops. WAV + stems included.',
    priceEth: '0.009',
    influencer: '0xddddeeee111122223333444455556666777788889',
    image: 'https://picsum.photos/seed/beats10/400/400',
    badge: 'New',
    category: 'Audio',
    sales: 5,
    earnings: '0.003',
    isNew: true,
    launchDate: '2025-12-19',
  },
  {
    id: 11,
    title: 'Tournament Entry',
    description: 'Jan 15 tournament. Top 3 split 2 ETH prize pool.',
    priceEth: '0.005',
    influencer: '0xeeee11112222333344445555666677778888999900',
    image: 'https://picsum.photos/seed/gaming11/400/400',
    badge: '11 spots',
    category: 'Gaming',
    sales: 9,
    earnings: '0.003',
    isNew: true,
    launchDate: '2025-12-18',
  },
  {
    id: 12,
    title: 'Coffee Subscription',
    description: 'Monthly beans delivery + 20% off at partner cafes.',
    priceEth: '0.022',
    influencer: '0x11112222333344445555666677778888999900001',
    image: 'https://picsum.photos/seed/coffee12/400/400',
    badge: 'Featured',
    category: 'Subscription',
    sales: 34,
    earnings: '0.52',
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
  { rank: 1, address: '0x1234...5678', username: 'tommy.eth', avatar: 'T', sales: 342, earnings: '4.18', badge: 'Top Curator' },
  { rank: 2, address: '0xabcd...ef12', username: 'sarah_k', avatar: 'S', sales: 289, earnings: '3.41' },
  { rank: 3, address: '0x9876...4321', username: 'mark.base', avatar: 'M', sales: 201, earnings: '2.87' },
  { rank: 4, address: '0xfedc...ba98', username: 'jules', avatar: 'J', sales: 167, earnings: '1.92' },
  { rank: 5, address: '0x5678...1234', username: 'anon4829', avatar: '?', sales: 134, earnings: '1.54' },
  { rank: 6, address: '0x2468...1357', username: 'chris.eth', avatar: 'C', sales: 98, earnings: '1.12' },
  { rank: 7, address: '0x1357...2468', username: '0xmike', avatar: 'M', sales: 71, earnings: '0.83' },
  { rank: 8, address: '0x8642...9753', username: 'elena_r', avatar: 'E', sales: 45, earnings: '0.52' },
];

const USER_STATS: UserStats = {
  totalEarnings: '0.847',
  totalSales: 23,
  rank: 847,
  nftsOwned: 4,
  referrals: 7,
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
          <div className="header-logo">V</div>
          <div>
            <h1 className="header-title">VibeCheck</h1>
            <p className="header-subtitle">Base marketplace</p>
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
        className={`bottom-nav-item ${view === 'transactions' ? 'active' : ''}`} 
        onClick={() => navigateTo('transactions')}
      >
        <Icons.FileText />
        <span>History</span>
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
            <img 
              src={product.image} 
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
          </div>
          <div className="product-content">
            <div className="product-badge">
              <span className="product-badge-dot" />
              {product.badge}
            </div>
            <h2 className="product-title">{product.title}</h2>
            <div className="product-curator">
              <div className="curator-avatar">{product.influencer.slice(2, 4).toUpperCase()}</div>
              <span className="curator-label">
                by <span className="curator-address">{shortenAddress(product.influencer)}</span>
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
          <div className="product-row-image">
            <img 
              src={product.image} 
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
            />
          </div>
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
      
      {/* Earnings Banner */}
      {walletAddress && (
        <div className="stats-banner fade-in-up">
          <div className="stat-box">
            <span className="stat-value">{USER_STATS.totalEarnings}</span>
            <span className="stat-label">ETH Earned</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-box">
            <span className="stat-value">{USER_STATS.totalSales}</span>
            <span className="stat-label">Sales</span>
          </div>
        </div>
      )}

      {/* Products */}
      {renderProductCard(PRODUCTS[0], true)}

      <div className="section-header" style={{ marginTop: 'var(--spacing-lg)' }}>
        <span className="section-title">Browse</span>
      </div>
      <div className="product-list">
        {PRODUCTS.slice(1, 8).map(product => renderProductCard(product))}
      </div>

      {renderBottomNav()}
    </div>
  );

  const renderVibe = () => (
    <div className="view-container fade-in-up">
      {renderHeader(true, 'Product Details')}

      <div className="product-detail-card">
        <div className="product-image large">
          <img 
            src={selectedProduct.image} 
            alt={selectedProduct.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          />
        </div>
        <div className="product-content">
          <div className="product-badge">
            <span className="product-badge-dot" />
            {selectedProduct.badge}
          </div>
          <h1 className="product-title" style={{ fontSize: '1.5rem' }}>{selectedProduct.title}</h1>
          <p className="product-description">{selectedProduct.description}</p>
          
          <div className="product-curator">
            <div className="curator-avatar">{selectedProduct.influencer.slice(2, 4).toUpperCase()}</div>
            <span className="curator-label">
              by <span className="curator-address">{shortenAddress(selectedProduct.influencer)}</span>
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
              <span className="detail-label">Referral</span>
              <span className="detail-value accent">7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bottom-bar">
        <div className="bottom-bar-content">
          <button
            className="btn btn-primary btn-lg btn-block"
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
        <h1 className="success-title">Purchase complete</h1>
        <p className="success-subtitle">
          You now own <strong>{selectedProduct.title}</strong>
        </p>

        <div className="success-card">
          <div className="success-nft">
            <img 
              src={selectedProduct.image} 
              alt={selectedProduct.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
            />
          </div>
          <div className="success-details">
            <p className="success-detail-label">Amount paid</p>
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

        {/* Referral Link */}
        <div className="referral-section">
          <h4>Share your link</h4>
          <p className="referral-description">
            Earn 7% when someone buys through your link
          </p>
          <div className="referral-link-box">
            <code className="referral-link">
              {`vibecheck.xyz/${shortenAddress(walletAddress || '0x0000')}`}
            </code>
            <button 
              className="btn-icon" 
              onClick={() => copyToClipboard(`${location.origin}/vibe/${walletAddress}`)}
            >
              {copied ? <Icons.Check /> : <Icons.Copy />}
            </button>
          </div>
        </div>

        <button 
          className="btn btn-primary btn-block mt-lg" 
          onClick={() => navigateTo('home')}
        >
          Done
        </button>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="view-container stagger-children">
      {renderHeader(false)}
      
      <div className="page-header">
        <h1 className="page-title">Leaderboard</h1>
        <p className="page-subtitle">Top sellers this week</p>
      </div>

      {/* Leaderboard List */}
      <div className="leaderboard-list">
        {LEADERBOARD.map((entry) => (
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

      {renderBottomNav()}
    </div>
  );

  const renderProfile = () => (
    <div className="view-container stagger-children">
      {renderHeader(false)}
      
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          {walletAddress ? walletAddress.slice(2, 4).toUpperCase() : '?'}
        </div>
        <h2 className="profile-name">
          {walletAddress ? shortenAddress(walletAddress) : 'Not Connected'}
        </h2>
      </div>

      {/* Simple Stats */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <span className="profile-stat-value">{USER_STATS.totalEarnings} ETH</span>
          <span className="profile-stat-label">Earned</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-value">{USER_STATS.totalSales}</span>
          <span className="profile-stat-label">Sales</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-value">{USER_STATS.referrals}</span>
          <span className="profile-stat-label">Referrals</span>
        </div>
      </div>

      {/* NFTs Owned */}
      <div className="section-header">
        <span className="section-title">Owned</span>
        <span className="section-count">{USER_STATS.nftsOwned} items</span>
      </div>
      <div className="nft-grid">
        {PRODUCTS.slice(0, USER_STATS.nftsOwned).map((product) => (
          <div key={product.id} className="nft-item">
            <img 
              src={product.image} 
              alt={product.title}
              className="nft-image"
              style={{ width: '100%', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
            />
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

  // ================== Transactions Page ==================
  const renderTransactions = () => {
    const filteredTx = getFilteredTransactions();
    
    return (
      <div className="view-container stagger-children">
        {renderHeader(false)}
        
        <div className="page-header">
          <h1 className="page-title">History</h1>
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
                {tx.type === 'buy' && '↓'}
                {tx.type === 'referral' && '←'}
                {tx.type === 'mint' && '◆'}
              </div>
              <div className="tx-content">
                <div className="tx-header">
                  <span className="tx-title">
                    {tx.type === 'buy' && 'Purchase'}
                    {tx.type === 'referral' && 'Referral'}
                    {tx.type === 'mint' && 'Mint'}
                  </span>
                </div>
                <div className="tx-hash">
                  <code>{shortenHash(tx.hash)}</code>
                </div>
              </div>
              <div className="tx-amount-col">
                <span className={`tx-amount ${tx.type === 'referral' ? 'positive' : tx.type === 'buy' ? 'negative' : ''}`}>
                  {tx.type === 'buy' && '-'}
                  {tx.type === 'referral' && '+'}
                  {tx.amount} ETH
                </span>
              </div>
            </div>
          ))}
        </div>

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
      {view === 'profile' && renderProfile()}
      {view === 'transactions' && renderTransactions()}
    </div>
  );
};

export default App;
