import { useMemo, useState } from "react";
import { SlidersHorizontal, SearchX } from "lucide-react";
import {
  SALONS,
  CATEGORIES,
  CATEGORY_MATCH,
  type Category,
  type Salon,
} from "./data/salons";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SalonCard from "./components/SalonCard";
import BookingModal from "./components/BookingModal";
import Toast from "./components/Toast";
import GlossAIConcierge from "./components/GlossAIConcierge";
import AppointmentsDrawer from "./components/AppointmentsDrawer";
import StyleMatchModal from "./components/StyleMatchModal";
import type { BookingRecord } from "./data/bookings";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastBookingId, setToastBookingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [styleMatchOpen, setStyleMatchOpen] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Count salons per category (respecting current search query) for capsule badges.
  const categoryCounts = useMemo(() => {
    const counts = {} as Record<Category, number>;
    for (const cat of CATEGORIES) {
      if (cat === "All") {
        counts.All = SALONS.filter(
          (s) =>
            !normalizedQuery ||
            s.name.toLowerCase().includes(normalizedQuery) ||
            s.locality.toLowerCase().includes(normalizedQuery)
        ).length;
      } else {
        const matchers = CATEGORY_MATCH[cat];
        counts[cat] = SALONS.filter((s) => {
          const inSearch =
            !normalizedQuery ||
            s.name.toLowerCase().includes(normalizedQuery) ||
            s.locality.toLowerCase().includes(normalizedQuery);
          const inCat =
            matchers.some((m) =>
              s.primaryCategory.toLowerCase().includes(m.toLowerCase())
            ) ||
            s.services.some((svc) =>
              matchers.some((m) =>
                svc.name.toLowerCase().includes(m.toLowerCase())
              )
            );
          return inSearch && inCat;
        }).length;
      }
    }
    return counts;
  }, [normalizedQuery]);

  const filteredSalons = useMemo(() => {
    return SALONS.filter((s) => {
      const inSearch =
        !normalizedQuery ||
        s.name.toLowerCase().includes(normalizedQuery) ||
        s.locality.toLowerCase().includes(normalizedQuery);
      if (!inSearch) return false;
      if (activeCategory === "All") return true;
      const matchers = CATEGORY_MATCH[activeCategory];
      const inCat =
        matchers.some((m) =>
          s.primaryCategory.toLowerCase().includes(m.toLowerCase())
        ) ||
        s.services.some((svc) =>
          matchers.some((m) => svc.name.toLowerCase().includes(m.toLowerCase()))
        );
      return inCat;
    });
  }, [normalizedQuery, activeCategory]);

  const openBooking = (salon: Salon) => {
    setSelectedSalon(salon);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleConfirmed = (booking: BookingRecord) => {
    setToastBookingId(booking.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categoryCounts={categoryCounts}
        onOpenAppointments={() => setDrawerOpen(true)}
        onOpenStyleMatch={() => setStyleMatchOpen(true)}
      />

      <Hero />

      {/* Grid section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-white">
              {activeCategory === "All"
                ? "All featured salons"
                : activeCategory}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {filteredSalons.length}{" "}
              {filteredSalons.length === 1 ? "result" : "results"} across Mumbai
              {normalizedQuery && (
                <>
                  {" "}
                  for "
                  <span className="text-slate-200">{searchQuery}</span>"
                </>
              )}
            </p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 text-xs text-slate-400 bg-white/[0.04] border border-white/5 px-3 py-1.5 rounded-full">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Sorted by rating
          </div>
        </div>

        {filteredSalons.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 mx-auto rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center mb-4">
              <SearchX className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="font-display text-xl text-white">
              No salons match your search
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Try a different locality, salon name, or category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="mt-5 inline-flex items-center justify-center bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredSalons.map((salon, i) => (
              <SalonCard
                key={salon.id}
                salon={salon}
                index={i}
                onCheckAvailability={openBooking}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} GlossHour · Mumbai's Luxury Salon
              Marketplace
            </div>
            <div className="flex items-center gap-5 text-xs text-slate-500">
              <a href="#" className="hover:text-amber-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                Partner with us
              </a>
            </div>
          </div>
        </div>
      </footer>

      {modalOpen && (
        <BookingModal
          key={selectedSalon?.id}
          salon={selectedSalon}
          onClose={closeModal}
          onConfirmed={handleConfirmed}
        />
      )}

      {toastBookingId && (
        <Toast
          bookingId={toastBookingId}
          onDone={() => setToastBookingId(null)}
        />
      )}

      <GlossAIConcierge onBookNow={openBooking} />

      <AppointmentsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {styleMatchOpen && (
        <StyleMatchModal
          salons={SALONS}
          onBookNow={openBooking}
          onClose={() => setStyleMatchOpen(false)}
        />
      )}
    </div>
  );
}
