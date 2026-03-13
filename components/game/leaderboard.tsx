"use client"

import { useEffect, useState } from "react"
import { Trophy, Medal, Crown, RefreshCw, Users, LogIn } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Player } from "@/lib/game-store"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  level: number
  id?: string
}

interface LeaderboardProps {
  player: Player
}

export function Leaderboard({ player }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = createClient()

  const fetchLeaderboard = async () => {
    setRefreshing(true)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, score, level")
      .order("score", { ascending: false })
      .limit(10)

    if (!error && data) {
      const entries: LeaderboardEntry[] = data.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        score: Number(entry.score),
        level: entry.level,
        id: entry.id
      }))
      setLeaderboard(entries)
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    // Check auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    fetchLeaderboard()

    // Subscribe to realtime updates
    const channel = supabase
      .channel("leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <span className="w-5 text-center text-muted-foreground font-mono">{rank}</span>
    }
  }

  const getRankStyle = (rank: number, isPlayer: boolean) => {
    if (isPlayer) {
      return "bg-primary/20 border-primary/50 shadow-[0_0_20px_rgba(0,255,200,0.2)]"
    }
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/30"
      case 2:
        return "bg-gray-400/10 border-gray-400/30"
      case 3:
        return "bg-amber-600/10 border-amber-600/30"
      default:
        return "bg-card/50 border-border/50"
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Live Leaderboard
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Real Players
            </p>
          </div>
        </div>
        <button
          onClick={fetchLeaderboard}
          disabled={refreshing}
          className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Login prompt if not logged in */}
      {!user && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-pink/10 border border-neon-cyan/30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-foreground">Want to compete?</p>
              <p className="text-sm text-muted-foreground">Sign up to save your score on the leaderboard!</p>
            </div>
            <Link
              href="/auth/sign-up"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-green text-background font-bold rounded-lg hover:opacity-90 transition-all whitespace-nowrap"
            >
              <LogIn className="h-4 w-4" />
              Join Now
            </Link>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-card/50 border border-border/50">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No players yet!</p>
          <p className="text-muted-foreground">Be the first to join the leaderboard</p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-neon-pink to-neon-orange text-background font-bold rounded-xl hover:opacity-90 transition-all"
          >
            Sign Up & Play
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isPlayer = user && entry.id === user.id

            return (
              <div
                key={`${entry.id || entry.username}-${entry.rank}`}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm
                  transition-all duration-300 hover:scale-[1.02]
                  ${getRankStyle(entry.rank, isPlayer || false)}
                `}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar & Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold truncate ${isPlayer ? "text-primary" : ""}`}>
                      {entry.username}
                    </span>
                    {isPlayer && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/30 text-primary">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">Level {entry.level}</span>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="font-bold text-lg tabular-nums">{entry.score.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Your current score if not on leaderboard */}
      {user && !leaderboard.some(e => e.id === user.id) && leaderboard.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
          <p className="text-muted-foreground">Keep clicking to reach the top 10!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your score: <span className="font-bold text-foreground">{player.score.toLocaleString()}</span>
          </p>
        </div>
      )}
    </div>
  )
}
