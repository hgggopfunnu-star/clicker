"use client"

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  type: 'multiplier' | 'power' | 'cosmetic'
  value: number
  icon: string
  owned: boolean
}

export interface Player {
  username: string
  score: number
  coins: number
  level: number
  xp: number
  multiplier: number
  autoClickers: number
  ownedItems: string[]
}

export interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  level: number
}

// Initial shop items
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'double-coins',
    name: 'Double Coins',
    description: '2x coins per click!',
    price: 100,
    type: 'multiplier',
    value: 2,
    icon: '💰',
    owned: false
  },
  {
    id: 'triple-coins',
    name: 'Triple Coins',
    description: '3x coins per click!',
    price: 500,
    type: 'multiplier',
    value: 3,
    icon: '💎',
    owned: false
  },
  {
    id: 'auto-clicker',
    name: 'Auto Clicker',
    description: 'Clicks 1x per second automatically!',
    price: 250,
    type: 'power',
    value: 1,
    icon: '🤖',
    owned: false
  },
  {
    id: 'super-auto',
    name: 'Super Auto Clicker',
    description: 'Clicks 5x per second automatically!',
    price: 1000,
    type: 'power',
    value: 5,
    icon: '⚡',
    owned: false
  },
  {
    id: 'mega-boost',
    name: 'Mega Boost',
    description: '10x score multiplier!',
    price: 2500,
    type: 'multiplier',
    value: 10,
    icon: '🚀',
    owned: false
  },
  {
    id: 'golden-touch',
    name: 'Golden Touch',
    description: 'Every 10th click gives 50x coins!',
    price: 5000,
    type: 'power',
    value: 50,
    icon: '✨',
    owned: false
  }
]

// Fake leaderboard data
export const FAKE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'ClickMaster99', score: 125000, level: 42 },
  { rank: 2, username: 'ProGamer_X', score: 98500, level: 38 },
  { rank: 3, username: 'SpeedClicker', score: 87200, level: 35 },
  { rank: 4, username: 'CoinHunter', score: 76400, level: 32 },
  { rank: 5, username: 'NeonKnight', score: 65800, level: 29 },
  { rank: 6, username: 'PixelWarrior', score: 54200, level: 26 },
  { rank: 7, username: 'GameAddict', score: 43600, level: 23 },
  { rank: 8, username: 'ClickerPro', score: 32100, level: 20 },
  { rank: 9, username: 'FunSeeker', score: 21500, level: 17 },
  { rank: 10, username: 'NewPlayer123', score: 10800, level: 14 },
]

// Calculate level from XP
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

// Calculate XP needed for next level
export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100
}

// Get initial player state
export function getInitialPlayer(): Player {
  if (typeof window === 'undefined') {
    return {
      username: 'Player',
      score: 0,
      coins: 0,
      level: 1,
      xp: 0,
      multiplier: 1,
      autoClickers: 0,
      ownedItems: []
    }
  }
  
  const saved = localStorage.getItem('lampytimepass_player')
  if (saved) {
    return JSON.parse(saved)
  }
  
  return {
    username: 'Player' + Math.floor(Math.random() * 9999),
    score: 0,
    coins: 0,
    level: 1,
    xp: 0,
    multiplier: 1,
    autoClickers: 0,
    ownedItems: []
  }
}

// Save player state
export function savePlayer(player: Player): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lampytimepass_player', JSON.stringify(player))
  }
}
