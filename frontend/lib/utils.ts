// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatWalletAddress = (address, startChars = 6, endChars = 3) => {
  if (!address) return '';
  
  // If address is shorter than the total chars to show, return as is
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};


const STATIC_WALLET_ICONS = {
  metamask: 'https://images.ctfassets.net/clixtyxoaeas/4rnpEzy1ATWRKVBOLxZ1Fm/a74dc1eed36d23d7ea6030383a4d5163/MetaMask-icon-fox.svg',
  walletconnect: 'https://walletconnect.com/walletconnect-logo.svg',
  coinbase: 'https://avatars.githubusercontent.com/u/18060234?s=200&v=4',
  trust: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg',
  rainbow: 'https://rainbow.me/assets/rainbow-logo.svg',
  phantom: 'https://phantom.app/img/phantom-logo.svg',
  brave: 'https://brave.com/static-assets/images/brave-logo.svg',
  binance: 'https://bin.bnbstatic.com/static/images/common/favicon.ico',
  ledger: 'https://www.ledger.com/wp-content/themes/ledger-v2/public/images/ledger-logo.svg',
  trezor: 'https://trezor.io/static/images/trezor-logo-h.svg',
};

// Name variations mapping
const NAME_VARIANTS = {
  'metamask': ['metamask', 'meta mask', 'meta-mask'],
  'walletconnect': ['walletconnect', 'wallet connect', 'wallet-connect', 'wc'],
  'coinbase': ['coinbase', 'coinbase wallet', 'coinbasewallet'],
  'trust': ['trust', 'trust wallet', 'trustwallet'],
  'rainbow': ['rainbow', 'rainbow wallet'],
  'phantom': ['phantom', 'phantom wallet'],
  'brave': ['brave', 'brave wallet'],
  'binance': ['binance', 'binance wallet', 'bnb'],
  'ledger': ['ledger', 'ledger wallet'],
  'trezor': ['trezor', 'trezor wallet'],
};

/**
 * Normalize wallet name to match our keys
 */
const normalizeWalletName = (name) => {
  if (!name) return null;
  
  const cleanName = name.toLowerCase().trim();
  
  // Find matching key by checking variants
  for (const [key, variants] of Object.entries(NAME_VARIANTS)) {
    if (variants.includes(cleanName)) {
      return key;
    }
  }
  
  // Direct match
  if (STATIC_WALLET_ICONS[cleanName]) {
    return cleanName;
  }
  
  return null;
};

export const getWalletIconByName = (walletName, useAPI = true) => {
  if (!walletName) return null;
  
  // Try static mapping first (fastest and most reliable)
  const normalizedName = normalizeWalletName(walletName);
  if (normalizedName && STATIC_WALLET_ICONS[normalizedName]) {
    return STATIC_WALLET_ICONS[normalizedName];
  }
  
  return null; // No icon found
};