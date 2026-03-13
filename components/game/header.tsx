"use client"

import { Zap, Coins, User, Trophy, ShoppingBag, LogOut, Cloud, CloudOff, Loader2 } from "lucide-react"
import type { Player } from "@/lib/game-store"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import Link from "next/link"

interface HeaderProps {
  player: Player
  activeTab: string
  setActiveTab: (tab: string) => void
  user?: SupabaseUser | null
  onLogout?: () => void
  syncStatus?: 'idle' | 'syncing' | 'synced'
}

export function GameHeader({ player, activeTab, setActiveTab, user, onLogout, syncStatus = 'idle' }: HeaderProps) {
  const tabs = [
    { id: 'home', label: 'Play', icon: Zap },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-cyan/50 blur-lg rounded-full" />
              <Zap className="relative h-8 w-8 text-neon-cyan" />
            </div>
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-green bg-clip-text text-transparent">
              LAMPYTIMEPASS
            </span>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
                  ${activeTab === tab.id 
                    ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(0,255,200,0.3)]' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Stats & Auth */}
          <div className="flex items-center gap-3">
            {/* Sync Status */}
            {user && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                {syncStatus === 'syncing' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Syncing</span>
                  </>
                )}
                {syncStatus === 'synced' && (
                  <>
                    <Cloud className="h-3 w-3 text-neon-green" />
                    <span className="text-neon-green">Saved</span>
                  </>
                )}
                {syncStatus === 'idle' && user && (
                  <Cloud className="h-3 w-3" />
                )}
              </div>
            )}
            {!user && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                <CloudOff className="h-3 w-3" />
                <span>Not synced</span>
              </div>
            )}

            {/* Coins */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30">
              <Coins className="h-4 w-4 text-accent" />
              <span className="font-bold text-accent">{player.coins.toLocaleString()}</span>
            </div>

            {/* Level */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30">
              <span className="text-xs text-muted-foreground">LVL</span>
              <span className="font-bold text-secondary">{player.level}</span>
            </div>

            {/* Auth Button */}
            {user ? (
              <button
                onClick={onLogout}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex md:hidden items-center justify-around pb-2 -mx-4 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-300
                ${activeTab === tab.id 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
                }
              `}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
