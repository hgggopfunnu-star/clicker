"use client"

import { Target, Coins, TrendingUp, Zap } from "lucide-react"
import type { Player } from "@/lib/game-store"
import { xpForNextLevel } from "@/lib/game-store"

interface StatsPanelProps {
  player: Player
}

export function StatsPanel({ player }: StatsPanelProps) {
  const xpNeeded = xpForNextLevel(player.level)
  const xpProgress = (player.xp / xpNeeded) * 100

  const stats = [
    {
      label: 'Total Score',
      value: player.score.toLocaleString(),
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
      borderColor: 'border-primary/30'
    },
    {
      label: 'Coins',
      value: player.coins.toLocaleString(),
      icon: Coins,
      color: 'text-accent',
      bgColor: 'bg-accent/20',
      borderColor: 'border-accent/30'
    },
    {
      label: 'Multiplier',
      value: `${player.multiplier}x`,
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
      borderColor: 'border-secondary/30'
    },
    {
      label: 'Auto Clicks/s',
      value: player.autoClickers.toString(),
      icon: Zap,
      color: 'text-neon-yellow',
      bgColor: 'bg-neon-yellow/20',
      borderColor: 'border-neon-yellow/30'
    },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Level Progress */}
      <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Level {player.level}</span>
          <span className="text-sm text-muted-foreground">{Math.floor(player.xp)} / {xpNeeded} XP</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500"
            style={{ width: `${Math.min(xpProgress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {Math.ceil(xpNeeded - player.xp)} XP until Level {player.level + 1}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`
              p-4 rounded-xl ${stat.bgColor} border ${stat.borderColor}
              backdrop-blur-sm transition-all duration-300
              hover:scale-105 hover:shadow-lg
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
