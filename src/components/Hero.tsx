import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-slate-950 border-b border-white/5"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -top-20 right-0 w-[30rem] h-[30rem] rounded-full bg-rose-500/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-slate-300">
              Mumbai's most curated salon marketplace
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.05] tracking-tight">
            Where the city's most{" "}
            <span className="text-gradient-gold">beautiful</span> begins.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300/90 max-w-xl leading-relaxed font-light">
            A hand-picked edit of Mumbai's finest salons — from couture bridal
            studios in Bandra to wellness sanctuaries by the sea. Discover,
            compare, and book in minutes.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-slate-300">
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Verified elite salons
            </div>
            <div className="inline-flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Instant confirmation
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
