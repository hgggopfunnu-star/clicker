"use client"

import { ShoppingBag, Check, Lock, Coins, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player, ShopItem } from "@/lib/game-store"
import { SHOP_ITEMS } from "@/lib/game-store"

interface ShopProps {
  player: Player
  onPurchase: (item: ShopItem) => void
}

export function Shop({ player, onPurchase }: ShopProps) {
  const getTypeColor = (type: ShopItem['type']) => {
    switch (type) {
      case 'multiplier':
        return { bg: 'bg-secondary/20', border: 'border-secondary/30', text: 'text-secondary' }
      case 'power':
        return { bg: 'bg-neon-cyan/20', border: 'border-neon-cyan/30', text: 'text-neon-cyan' }
      case 'cosmetic':
        return { bg: 'bg-neon-pink/20', border: 'border-neon-pink/30', text: 'text-neon-pink' }
    }
  }

  const getTypeLabel = (type: ShopItem['type']) => {
    switch (type) {
      case 'multiplier': return 'Multiplier'
      case 'power': return 'Power-Up'
      case 'cosmetic': return 'Cosmetic'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/20 border border-accent/30">
            <ShoppingBag className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-accent to-neon-orange bg-clip-text text-transparent">
              Power Shop
            </h2>
            <p className="text-sm text-muted-foreground">Upgrade your clicking power!</p>
          </div>
        </div>

        {/* Balance */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30">
          <Coins className="h-5 w-5 text-accent" />
          <span className="font-bold text-accent text-lg">{player.coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Shop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHOP_ITEMS.map((item) => {
          const isOwned = player.ownedItems.includes(item.id)
          const canAfford = player.coins >= item.price
          const colors = getTypeColor(item.type)

          return (
            <div
              key={item.id}
              className={`
                relative p-5 rounded-2xl border backdrop-blur-sm
                transition-all duration-300
                ${isOwned 
                  ? 'bg-primary/10 border-primary/30' 
                  : `${colors.bg} ${colors.border} hover:scale-[1.02] hover:shadow-xl`
                }
              `}
            >
              {/* Type Badge */}
              <div className={`
                absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium
                ${colors.bg} ${colors.border} border ${colors.text}
              `}>
                {getTypeLabel(item.type)}
              </div>

              {/* Icon */}
              <div className="text-5xl mb-3">{item.icon}</div>

              {/* Name & Description */}
              <h3 className="font-bold text-lg mb-1">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>

              {/* Price & Button */}
              {isOwned ? (
                <div className="flex items-center gap-2 text-primary">
                  <Check className="h-5 w-5" />
                  <span className="font-semibold">Owned</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-accent" />
                    <span className={`font-bold ${canAfford ? 'text-accent' : 'text-muted-foreground'}`}>
                      {item.price.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onPurchase(item)}
                    disabled={!canAfford}
                    className={`
                      ${canAfford 
                        ? 'bg-primary hover:bg-primary/80 text-primary-foreground shadow-[0_0_20px_rgba(0,255,200,0.3)]' 
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }
                    `}
                  >
                    {canAfford ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-1" />
                        Buy
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-1" />
                        Locked
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty state if all owned */}
      {SHOP_ITEMS.every(item => player.ownedItems.includes(item.id)) && (
        <div className="mt-8 p-6 rounded-2xl bg-primary/10 border border-primary/30 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-primary mb-3" />
          <h3 className="text-xl font-bold text-primary mb-2">All Items Unlocked!</h3>
          <p className="text-muted-foreground">You&apos;re a true clicking champion!</p>
        </div>
      )}
    </div>
  )
}
