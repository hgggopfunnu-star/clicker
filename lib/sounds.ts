"use client"

// Sound frequencies for different game events
const SOUNDS = {
  click: [523.25, 0.1], // C5
  coin: [783.99, 0.15], // G5
  levelUp: [523.25, 0.1, 659.25, 0.1, 783.99, 0.2], // C5, E5, G5 chord
  purchase: [440, 0.1, 554.37, 0.1, 659.25, 0.15], // A4, C#5, E5
  error: [311.13, 0.2], // Eb4
  bonus: [1046.5, 0.1, 1318.51, 0.1, 1567.98, 0.2], // High C6, E6, G6
} as const

type SoundType = keyof typeof SOUNDS

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

export function playSound(type: SoundType): void {
  if (typeof window === 'undefined') return
  
  try {
    const ctx = getAudioContext()
    const frequencies = SOUNDS[type]
    
    let time = ctx.currentTime
    
    for (let i = 0; i < frequencies.length; i += 2) {
      const freq = frequencies[i] as number
      const duration = frequencies[i + 1] as number
      
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.value = freq
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, time)
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration)
      
      oscillator.start(time)
      oscillator.stop(time + duration)
      
      time += duration * 0.8 // Slight overlap for smoother sound
    }
  } catch {
    // Audio not supported or blocked
  }
}

// Click sound with pitch variation based on combo
export function playClickSound(combo: number = 1): void {
  if (typeof window === 'undefined') return
  
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    // Higher pitch with more combo
    const baseFreq = 523.25 + (combo * 50)
    oscillator.frequency.value = Math.min(baseFreq, 2000)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
    
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.08)
  } catch {
    // Audio not supported or blocked
  }
}
