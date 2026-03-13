"use client"

import { useState } from "react"
import { User, Edit2, Check, Trophy, Coins, Target, Zap, RotateCcw, LogIn, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Player } from "@/lib/game-store"
import { xpForNextLevel } from "@/lib/game-store"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import Link from "next/link"

interface ProfileProps {
  player: Player
  onUpdateUsername: (name: string) => void
  onResetProgress: () => void
  user?: SupabaseUser | null
  onLogout?: () => void
}

export function Profile({ player, onUpdateUsername, onResetProgress, user, onLogout }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState(player.username)

  const handleSave = () => {
    if (newUsername.trim()) {
      onUpdateUsername(newUsername.trim())
      setIsEditing(false)
    }
  }

  const xpNeeded = xpForNextLevel(player.level)
  const xpProgress = (player.xp / xpNeeded) * 100

  const achievements = [
    { 
      id: 'first-click', 
      name: 'First Click', 
      description: 'Made your first click', 
      unlocked: player.score > 0,
      icon: '🖱️'
    },
    { 
      id: 'hundred-club', 
      name: '100 Club', 
      description: 'Reached 100 score', 
      unlocked: player.score >= 100,
      icon: '💯'
    },
    { 
      id: 'thousand-clicks', 
      name: 'Click Master', 
      description: 'Reached 1,000 score', 
      unlocked: player.score >= 1000,
      icon: '🏆'
    },
    { 
      id: 'rich', 
      name: 'Getting Rich', 
      description: 'Earned 500 coins', 
      unlocked: player.coins >= 500,
      icon: '💰'
    },
    { 
      id: 'shopper', 
      name: 'First Purchase', 
      description: 'Bought your first item', 
      unlocked: player.ownedItems.length > 0,
      icon: '🛍️'
    },
    { 
      id: 'level5', 
      name: 'Level 5', 
      description: 'Reached level 5', 
      unlocked: player.level >= 5,
      icon: '⭐'
    },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Account Status */}
      {!user && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-pink/10 border border-neon-cyan/30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-neon-cyan" />
              <div>
                <p className="font-medium text-foreground">Playing as Guest</p>
                <p className="text-sm text-muted-foreground">Sign up to save progress and compete!</p>
              </div>
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

      {user && (
        <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-neon-green" />
              <div>
                <p className="font-medium text-foreground">Logged In</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 border border-border text-foreground font-medium rounded-lg hover:bg-muted/50 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
        {/* Avatar & Name */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-[0_0_30px_rgba(0,255,200,0.3)]">
              <User className="h-10 w-10 text-background" />
            </div>
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
              LVL {player.level}
            </div>
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="h-9 bg-input border-border"
                  maxLength={20}
                  autoFocus
                />
                <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{player.username}</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {user ? 'Verified Player' : 'Guest Player'}
            </p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Level Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.floor(player.xp)} / {xpNeeded} XP
            </span>
          </div>
          <div className="h-4 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500"
              style={{ width: `${Math.min(xpProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <Target className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{player.score.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Score</p>
          </div>
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
            <Coins className="h-5 w-5 mx-auto text-accent mb-1" />
            <p className="text-lg font-bold">{player.coins.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Coins</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-center">
            <Trophy className="h-5 w-5 mx-auto text-secondary mb-1" />
            <p className="text-lg font-bold">{player.ownedItems.length}</p>
            <p className="text-xs text-muted-foreground">Items Owned</p>
          </div>
          <div className="p-3 rounded-xl bg-neon-yellow/10 border border-neon-yellow/20 text-center">
            <Zap className="h-5 w-5 mx-auto text-neon-yellow mb-1" />
            <p className="text-lg font-bold">{player.multiplier}x</p>
            <p className="text-xs text-muted-foreground">Multiplier</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`
                p-3 rounded-xl border text-center transition-all duration-300
                ${achievement.unlocked 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'bg-muted/30 border-border/30 opacity-50'
                }
              `}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <p className="font-semibold text-sm">{achievement.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-destructive">Reset Progress</p>
            <p className="text-sm text-muted-foreground">Start fresh (cannot be undone)</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onResetProgress}
            className="shadow-[0_0_15px_rgba(255,100,100,0.3)]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
