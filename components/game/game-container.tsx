"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GameHeader } from "./header"
import { ClickButton } from "./click-button"
import { StatsPanel } from "./stats-panel"
import { Leaderboard } from "./leaderboard"
import { Shop } from "./shop"
import { Profile } from "./profile"
import { createClient } from "@/lib/supabase/client"
import { 
  getInitialPlayer, 
  savePlayer, 
  calculateLevel, 
  type Player,
  type ShopItem
} from "@/lib/game-store"
import { playClickSound, playSound } from "@/lib/sounds"
import { Sparkles, LogIn } from "lucide-react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

export function GameContainer() {
  const [player, setPlayer] = useState<Player | null>(null)
  const [activeTab, setActiveTab] = useState('home')
  const [clickCount, setClickCount] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle')
  const autoClickerRef = useRef<NodeJS.Timeout | null>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  // Check auth status and load player
  useEffect(() => {
    const initPlayer = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Load from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setPlayer({
            username: profile.username,
            score: Number(profile.score),
            coins: Number(profile.coins),
            level: profile.level,
            xp: Number(profile.xp),
            multiplier: profile.multiplier,
            autoClickers: profile.auto_clickers,
            ownedItems: profile.owned_items || []
          })
        } else {
          setPlayer(getInitialPlayer())
        }
      } else {
        setPlayer(getInitialPlayer())
      }
    }

    initPlayer()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Load profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setPlayer({
            username: profile.username,
            score: Number(profile.score),
            coins: Number(profile.coins),
            level: profile.level,
            xp: Number(profile.xp),
            multiplier: profile.multiplier,
            autoClickers: profile.auto_clickers,
            ownedItems: profile.owned_items || []
          })
        }
      } else if (event === 'SIGNED_OUT') {
        setPlayer(getInitialPlayer())
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sync to database (debounced)
  const syncToDatabase = useCallback(async (playerData: Player) => {
    if (!user) return

    setSyncStatus('syncing')

    const { error } = await supabase
      .from('profiles')
      .update({
        username: playerData.username,
        score: playerData.score,
        coins: playerData.coins,
        level: playerData.level,
        xp: playerData.xp,
        multiplier: playerData.multiplier,
        auto_clickers: playerData.autoClickers,
        owned_items: playerData.ownedItems,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    setSyncStatus(error ? 'idle' : 'synced')
    
    // Reset sync status after 2 seconds
    setTimeout(() => setSyncStatus('idle'), 2000)
  }, [user, supabase])

  // Save player whenever it changes
  useEffect(() => {
    if (player) {
      savePlayer(player)

      // Debounced sync to database
      if (user) {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current)
        }
        syncTimeoutRef.current = setTimeout(() => {
          syncToDatabase(player)
        }, 1000)
      }
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [player, user, syncToDatabase])

  // Auto clicker effect
  useEffect(() => {
    if (!player || player.autoClickers === 0) return

    if (autoClickerRef.current) {
      clearInterval(autoClickerRef.current)
    }

    autoClickerRef.current = setInterval(() => {
      handleClick(true)
    }, 1000 / player.autoClickers)

    return () => {
      if (autoClickerRef.current) {
        clearInterval(autoClickerRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.autoClickers, player?.multiplier])

  const handleClick = useCallback((isAuto = false) => {
    if (!player) return

    setClickCount(prev => prev + 1)
    
    // Check for golden touch bonus
    const hasGoldenTouch = player.ownedItems.includes('golden-touch')
    const isBonus = hasGoldenTouch && clickCount % 10 === 9
    
    // Calculate coins earned
    const coinsEarned = isBonus ? player.multiplier * 50 : player.multiplier
    
    // Calculate XP (each click gives some XP)
    const xpEarned = 1 + (player.multiplier - 1) * 0.5

    setPlayer(prev => {
      if (!prev) return prev
      
      const newXp = prev.xp + xpEarned
      const newLevel = calculateLevel(newXp)
      
      // Check for level up
      if (newLevel > prev.level) {
        setShowLevelUp(true)
        playSound('levelUp')
        setTimeout(() => setShowLevelUp(false), 2000)
      }

      return {
        ...prev,
        score: prev.score + coinsEarned,
        coins: prev.coins + coinsEarned,
        xp: newXp,
        level: newLevel
      }
    })

    // Play sound
    if (!isAuto) {
      if (isBonus) {
        playSound('bonus')
      } else {
        playClickSound(clickCount % 10)
      }
    }
  }, [player, clickCount])

  const handlePurchase = useCallback((item: ShopItem) => {
    if (!player || player.coins < item.price || player.ownedItems.includes(item.id)) {
      playSound('error')
      return
    }

    playSound('purchase')

    setPlayer(prev => {
      if (!prev) return prev

      let newMultiplier = prev.multiplier
      let newAutoClickers = prev.autoClickers

      // Apply item effects
      if (item.type === 'multiplier') {
        newMultiplier = Math.max(newMultiplier, item.value)
      } else if (item.type === 'power') {
        if (item.id === 'auto-clicker' || item.id === 'super-auto') {
          newAutoClickers += item.value
        }
      }

      return {
        ...prev,
        coins: prev.coins - item.price,
        ownedItems: [...prev.ownedItems, item.id],
        multiplier: newMultiplier,
        autoClickers: newAutoClickers
      }
    })
  }, [player])

  const handleUpdateUsername = useCallback((name: string) => {
    setPlayer(prev => prev ? { ...prev, username: name } : prev)
  }, [])

  const handleResetProgress = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lampytimepass_player')
    }
    
    // If logged in, reset in database too
    if (user) {
      await supabase
        .from('profiles')
        .update({
          score: 0,
          coins: 0,
          level: 1,
          xp: 0,
          multiplier: 1,
          auto_clickers: 0,
          owned_items: []
        })
        .eq('id', user.id)
    }

    setPlayer(getInitialPlayer())
    setClickCount(0)
    playSound('click')
  }, [user, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setPlayer(getInitialPlayer())
  }

  // Loading state
  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 animate-pulse" />
          <p className="text-muted-foreground">Loading LAMPYTIMEPASS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce bg-gradient-to-r from-primary via-secondary to-accent p-1 rounded-2xl">
            <div className="bg-background px-8 py-6 rounded-xl text-center">
              <Sparkles className="h-12 w-12 mx-auto text-accent mb-2" />
              <p className="text-2xl font-bold">LEVEL UP!</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Level {player.level}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <GameHeader 
        player={player} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        syncStatus={syncStatus}
      />

      {/* Login prompt banner */}
      {!user && activeTab === 'home' && (
        <div className="container mx-auto px-4 mt-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-pink/10 border border-neon-cyan/30 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-foreground">Save your progress!</p>
              <p className="text-sm text-muted-foreground">Sign up to sync scores and compete on the live leaderboard</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 border border-border text-foreground font-medium rounded-lg hover:bg-muted/50 transition-all"
              >
                Login
              </Link>
              <Link
                href="/auth/sign-up"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-green text-background font-bold rounded-lg hover:opacity-90 transition-all"
              >
                <LogIn className="h-4 w-4" />
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {activeTab === 'home' && (
          <div className="flex flex-col items-center gap-8">
            {/* Welcome Message */}
            <div className="text-center mb-4">
              <h1 className="text-3xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-green bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                LAMPYTIMEPASS
              </h1>
              <p className="text-muted-foreground">Click your way to glory!</p>
              {user && (
                <p className="text-sm text-neon-green mt-1">Playing as {player.username}</p>
              )}
            </div>

            {/* Click Button */}
            <ClickButton
              onClick={() => handleClick(false)}
              multiplier={player.multiplier}
              hasGoldenTouch={player.ownedItems.includes('golden-touch')}
              clickCount={clickCount}
            />

            {/* Stats */}
            <StatsPanel player={player} />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard player={player} />
        )}

        {activeTab === 'shop' && (
          <Shop player={player} onPurchase={handlePurchase} />
        )}

        {activeTab === 'profile' && (
          <Profile 
            player={player} 
            onUpdateUsername={handleUpdateUsername}
            onResetProgress={handleResetProgress}
            user={user}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-muted-foreground border-t border-border/30">
        <p>Made with fun by LAMPYTIMEPASS Team</p>
      </footer>
    </div>
  )
}
