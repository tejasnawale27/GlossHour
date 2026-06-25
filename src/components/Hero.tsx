import { Sparkles, ShieldCheck, Zap, Star, Navigation } from "lucide-react";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-slate-950 border-b border-white/5 min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] flex">

      {/* ── Left panel 45% ─────────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-center w-full lg:w-[45%] px-6 sm:px-10 lg:px-14 py-16 lg:py-20">

        {/* Brushed-silk gradient underneath left side */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0e0e1a] to-[#12111f]" />

        {/* Geometric map-coordinate grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(251,191,36,0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(251,191,36,0.6) 1px, transparent 1px)
            `,
            backgroundSize: "42px 42px",
          }}
        />
        {/* Coordinate crosshair dots */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(251,191,36,0.9) 1px, transparent 1px)`,
            backgroundSize: "42px 42px",
            backgroundPosition: "21px 21px",
          }}
        />

        {/* Ambient amber glow — left side only */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-amber-500/10 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-[20rem] h-[20rem] rounded-full bg-amber-400/5 blur-[80px]" />

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-400/[0.08] border border-amber-400/20 rounded-full px-3.5 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-300/90 tracking-wide">
              Mumbai's most curated salon marketplace
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] text-white leading-[1.07] tracking-tight">
            Where the city's most{" "}
            <span className="relative inline-block text-gradient-gold animate-beautiful-glow">
              beautiful
            </span>{" "}
            begins.
          </h1>

          {/* Subtext */}
          <p className="mt-5 text-base sm:text-[1.05rem] text-slate-300/80 leading-relaxed font-light max-w-[440px]">
            A hand-picked edit of Mumbai's finest salons — from couture bridal
            studios in Bandra to wellness sanctuaries by the sea. Discover,
            compare, and book in minutes.
          </p>

          {/* Feature badges */}
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Verified elite salons</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Instant confirmation</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400/30 shrink-0" />
              <span>4.8+ rated network</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel 55% — only visible lg+ ─────────────── */}
      <div className="hidden lg:block relative w-[55%] overflow-hidden">
        {/* Editorial hero photograph */}
        <img
          src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1600&q=90"
          alt="Elegant woman in luxury Mumbai penthouse spa at golden hour"
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02]"
        />

        {/* Left-edge blend so image merges into left panel */}
        <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#0e0e1a] to-transparent pointer-events-none" />

        {/* Top + bottom vignette */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/70 to-transparent pointer-events-none" />

        {/* Subtle warm colour grade to complement golden hour */}
        <div className="absolute inset-0 bg-gradient-to-tl from-amber-900/8 via-transparent to-transparent pointer-events-none" />

        {/* Floating stats card */}
        <div className="absolute top-8 right-8 bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-1.5">Live on platform</div>
          <div className="flex items-end gap-3">
            <div className="text-center">
              <div className="font-display text-2xl text-amber-400">12</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Salons</div>
            </div>
            <div className="w-px h-8 bg-white/10 mb-1" />
            <div className="text-center">
              <div className="font-display text-2xl text-white">4.8</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Avg rating</div>
            </div>
            <div className="w-px h-8 bg-white/10 mb-1" />
            <div className="text-center">
              <div className="font-display text-2xl text-white">15k+</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Reviews</div>
            </div>
          </div>
        </div>

        {/* Gold compass icon — bottom edge */}
        <div className="absolute bottom-6 right-8 flex items-center gap-2.5 bg-slate-950/65 backdrop-blur-md border border-amber-400/20 rounded-full px-3.5 py-2 shadow-lg">
          <Navigation className="w-4 h-4 text-amber-400 fill-amber-400/20" strokeWidth={1.5} />
          <span className="text-[11px] font-semibold text-amber-300/90 tracking-wide">
            Mumbai, Maharashtra
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
        </div>
      </div>

      {/* Mobile: full-width ambient image behind text (very subtle) */}
      <div className="absolute inset-0 lg:hidden opacity-[0.12] pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=60"
          alt=""
          aria-hidden
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/60" />
      </div>
    </section>
  );
}
