import Link from "next/link"
import { Zap, Mail, ArrowRight } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/lampytimepass" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-pink flex items-center justify-center">
              <Zap className="w-7 h-7 text-background" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
              LAMPYTIMEPASS
            </span>
          </Link>
        </div>

        {/* Success Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl shadow-neon-green/5">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center animate-pulse">
            <Mail className="w-10 h-10 text-background" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-foreground">Check Your Email!</h1>
          <p className="text-muted-foreground mb-6">
            We&apos;ve sent you a confirmation link. Click it to activate your account and start competing!
          </p>

          <div className="space-y-3">
            <Link
              href="/lampytimepass"
              className="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-green text-background font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Play While Waiting
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              href="/auth/login"
              className="block w-full py-3 border border-border text-foreground font-medium rounded-xl hover:bg-muted/50 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
