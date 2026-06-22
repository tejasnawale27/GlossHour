import { Star, MapPin, Clock, ArrowUpRight } from "lucide-react";
import type { Salon } from "../data/salons";

interface SalonCardProps {
  salon: Salon;
  index: number;
  onCheckAvailability: (s: Salon) => void;
}

function tierLabel(tier: Salon["priceRange"]) {
  const map: Record<string, string> = {
    "₹₹": "Premium",
    "₹₹₹": "Luxury",
    "₹₹₹₹": "Ultra Luxury",
  };
  return map[tier] ?? "Luxury";
}

export default function SalonCard({
  salon,
  index,
  onCheckAvailability,
}: SalonCardProps) {
  const lowestPrice = Math.min(...salon.services.map((s) => s.price));
  const topService = salon.services[0];

  return (
    <article
      className="animate-fade-in-up group flex flex-col bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-400/20 transition-all duration-500 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1"
      style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-slate-800">
        <img
          src={salon.image}
          alt={salon.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        {/* Locality badge */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-slate-950/70 backdrop-blur-md border border-white/10 text-white text-xs font-medium px-2.5 py-1.5 rounded-full">
          <MapPin className="w-3 h-3 text-amber-400" />
          {salon.locality}
        </div>

        {/* Pricing tier indicator */}
        <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1.5 rounded-full tracking-wide">
          {salon.priceRange} · {tierLabel(salon.priceRange)}
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="text-[10px] uppercase tracking-[0.18em] text-amber-400/90">
            {salon.primaryCategory}
          </span>
          <h3 className="font-display text-xl text-white leading-tight mt-0.5">
            {salon.name}
          </h3>
          <p className="text-xs text-slate-300/90 mt-0.5">{salon.tagline}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        {/* Rating */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 bg-slate-800/80 border border-amber-400/30 px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-white tabular-nums">
              {salon.rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-slate-400 tabular-nums">
              ({salon.reviewCount.toLocaleString("en-IN")})
            </span>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              from
            </div>
            <div className="text-sm font-semibold text-white tabular-nums">
              ₹{lowestPrice.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Featured service */}
        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-300 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
          <span className="truncate">
            <span className="text-amber-400/80">Featured ·</span>{" "}
            {topService.name}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400 shrink-0">
            <Clock className="w-3 h-3" />
            {topService.durationMin}m
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={() => onCheckAvailability(salon)}
          className="mt-4 inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-amber-400 text-white hover:text-slate-950 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 group/btn border border-white/5 hover:border-amber-400"
        >
          Check Availability
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </button>
      </div>
    </article>
  );
}
