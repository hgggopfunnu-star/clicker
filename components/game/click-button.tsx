"use client"

import { useState, useCallback } from "react"
import { Zap } from "lucide-react"

interface ClickButtonProps {
  onClick: () => void
  multiplier: number
  hasGoldenTouch: boolean
  clickCount: number
}

interface FloatingNumber {
  id: number
  value: number
  x: number
  y: number
  isBonus: boolean
}

export function ClickButton({ onClick, multiplier, hasGoldenTouch, clickCount }: ClickButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 100)

    // Calculate value
    const isBonus = hasGoldenTouch && clickCount % 10 === 9
    const value = isBonus ? multiplier * 50 : multiplier

    // Create floating number at click position
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const id = Date.now() + Math.random()
    setFloatingNumbers(prev => [...prev, { id, value, x, y, isBonus }])

    // Remove floating number after animation
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(n => n.id !== id))
    }, 1000)

    onClick()
  }, [onClick, multiplier, hasGoldenTouch, clickCount])

  return (
    <div className="relative flex flex-col items-center">
      {/* Floating numbers */}
      {floatingNumbers.map(num => (
        <div
          key={num.id}
          className={`
            absolute pointer-events-none font-bold text-2xl
            animate-[float-up_1s_ease-out_forwards]
            ${num.isBonus ? 'text-accent text-4xl' : 'text-primary'}
          `}
          style={{
            left: num.x,
            top: num.y,
          }}
        >
          +{num.value}
        </div>
      ))}

      {/* Glow effects */}
      <div className="absolute inset-0 -m-8 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-2xl pointer-events-none" />
      
      {/* Main button */}
      <button
        onClick={handleClick}
        className={`
          relative w-48 h-48 sm:w-64 sm:h-64 rounded-full
          bg-gradient-to-br from-primary via-neon-cyan to-neon-green
          shadow-[0_0_40px_rgba(0,255,200,0.5),inset_0_0_60px_rgba(255,255,255,0.2)]
          transition-all duration-100 ease-out
          hover:shadow-[0_0_60px_rgba(0,255,200,0.7),inset_0_0_80px_rgba(255,255,255,0.3)]
          active:scale-95
          ${isPressed ? 'scale-90 brightness-125' : 'scale-100'}
          ${isPressed ? '' : 'animate-pulse-glow'}
        `}
      >
        {/* Inner glow ring */}
        <div className="absolute inset-4 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Zap className={`h-16 w-16 sm:h-20 sm:w-20 text-background transition-transform ${isPressed ? 'scale-110' : ''}`} />
            <span className="text-lg sm:text-xl font-bold text-background tracking-widest">
              CLICK ME!
            </span>
          </div>
        </div>

        {/* Pulse ring animation */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/50 animate-ping" />
      </button>

      {/* Multiplier indicator */}
      {multiplier > 1 && (
        <div className="mt-4 px-4 py-2 rounded-full bg-accent/20 border border-accent/50 animate-float">
          <span className="text-accent font-bold">{multiplier}x MULTIPLIER</span>
        </div>
      )}

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(1.5);
          }
        }
      `}</style>
    </div>
  )
}
