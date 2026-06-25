import { Search, Sparkles, CalendarDays } from "lucide-react";
import { CATEGORIES, type Category } from "../data/salons";
import { loadBookings } from "../data/bookings";
import { useState, useEffect } from "react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: Category;
  onCategoryChange: (c: Category) => void;
  categoryCounts: Record<Category, number>;
  onOpenAppointments: () => void;
  onOpenStyleMatch: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  categoryCounts,
  onOpenAppointments,
  onOpenStyleMatch,
}: HeaderProps) {
  const [bookingCount, setBookingCount] = useState(() => loadBookings().length);

  // Refresh count when the component re-renders (e.g. after a new booking)
  useEffect(() => {
    setBookingCount(loadBookings().length);
  });

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between w-full px-4 sm:px-6 lg:px-8 h-16">
          {/* Left Zone: Logo */}
          <a href="#top" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg text-white tracking-tight">
                GlossHour
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-amber-400/80 -mt-0.5">
                Mumbai
              </div>
            </div>
          </a>

          {/* Center Zone: Search */}
          <div className="flex-1 max-w-3xl mx-4 sm:mx-8">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-amber-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search salons or localities…"
                className="w-full bg-white/[0.06] border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:bg-white/[0.1] focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/15 transition-all"
              />
            </div>
          </div>

          {/* Right Zone: Calendar + CTA */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={onOpenAppointments}
              title="My Appointments"
              className="relative w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/8 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all"
            >
              <CalendarDays className="w-4.5 h-4.5 transition-colors" />
              {bookingCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-amber-400 text-slate-950 text-[9px] font-bold rounded-full px-1 leading-none tabular-nums shadow-md shadow-amber-500/30">
                  {bookingCount > 9 ? "9+" : bookingCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenStyleMatch}
              className="hidden md:inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-semibold px-4 py-2 rounded-full transition-colors"
            >
              Vision AI StyleMatch
            </button>
          </div>
        </div>
      </div>

      {/* Category capsule bar */}
      <div className="bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 max-w-7xl mx-auto">
            {CATEGORIES.map((cat) => {
              const active = cat === activeCategory;
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    active
                      ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                      : "bg-white/[0.06] text-slate-300 hover:bg-white/[0.12] hover:text-white border border-white/5"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[11px] tabular-nums rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                      active
                        ? "bg-slate-950/20 text-slate-900"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
