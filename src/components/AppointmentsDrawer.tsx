import { useState } from "react";
import {
  X,
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
  Trash2,
  CalendarX,
  Ticket,
} from "lucide-react";
import { loadBookings, removeBooking, type BookingRecord } from "../data/bookings";
import BoardingPassModal from "./BoardingPassModal";

interface AppointmentsDrawerProps {
  open: boolean;
  onClose: () => void;
}

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function AppointmentsDrawer({ open, onClose }: AppointmentsDrawerProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>(() => loadBookings());
  const [viewingBooking, setViewingBooking] = useState<BookingRecord | null>(null);

  const handleRemove = (id: string) => {
    removeBooking(id);
    setBookings(loadBookings());
  };

  // Reload from storage every time the drawer opens
  const handleOpen = () => {
    setBookings(loadBookings());
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />

        {/* Panel */}
        <div
          className="relative w-full max-w-sm h-full flex flex-col bg-slate-900 border-l border-white/8 shadow-2xl shadow-black/70 animate-drawer-in"
          onAnimationStart={handleOpen}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/20 flex items-center justify-center">
                <CalendarDays className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">My Appointments</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {bookings.length === 0
                    ? "No upcoming bookings"
                    : `${bookings.length} booking${bookings.length > 1 ? "s" : ""} saved`}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-5">
            {bookings.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {bookings.map((b, i) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    index={i}
                    onRemove={handleRemove}
                    onViewTicket={() => setViewingBooking(b)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-white/5 px-5 py-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/60" />
              Powered by GlossHour · Tap any booking to view your pass
            </div>
          </div>
        </div>
      </div>

      {/* Boarding pass modal — rendered outside the drawer panel so it stacks above */}
      {viewingBooking && (
        <BoardingPassModal
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
        />
      )}
    </>
  );
}

/* ─── Empty state ──────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-850 border border-white/5 flex items-center justify-center mb-5 shadow-xl shadow-black/30">
        <CalendarX className="w-9 h-9 text-slate-500" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg text-white mb-2">No upcoming appointments</h3>
      <p className="text-sm text-slate-400 leading-relaxed max-w-[240px]">
        Your confirmed bookings will appear here. Browse our curated salons and reserve your slot.
      </p>
      <div className="mt-6 flex flex-col gap-2 w-full max-w-[220px]">
        {["Bridal Makeup", "Luxury Spa", "Haircut"].map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/5 rounded-xl"
          >
            <Sparkles className="w-3 h-3 text-amber-400/60 shrink-0" />
            <span className="text-xs text-slate-400">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Booking card ─────────────────────────────────────────── */

function BookingCard({
  booking,
  index,
  onRemove,
  onViewTicket,
}: {
  booking: BookingRecord;
  index: number;
  onRemove: (id: string) => void;
  onViewTicket: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/8 bg-white/[0.025] animate-msg-pop cursor-pointer group hover:border-amber-400/25 transition-colors"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={onViewTicket}
    >
      {/* Salon image strip */}
      <div className="relative h-20">
        <img
          src={booking.salonImage}
          alt={booking.salonName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
        {/* Booking ref badge */}
        <div className="absolute top-2 right-2 font-mono text-[10px] font-bold text-amber-400 bg-slate-950/70 backdrop-blur-sm border border-amber-400/20 px-2 py-0.5 rounded-full tracking-widest">
          {booking.id}
        </div>
        {/* View ticket hint */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-amber-400/20 border border-amber-400/30 text-amber-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
          <Ticket className="w-3 h-3" />
          View Pass
        </div>
        <div className="absolute bottom-2 left-3">
          <div className="font-display text-sm text-white leading-tight">{booking.salonName}</div>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <CalendarDays className="w-3.5 h-3.5 text-amber-400/70" />
            {booking.dateLabel}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400/70" />
            {booking.time}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {booking.salonLocality}, Mumbai
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {booking.services.slice(0, 2).map((s) => (
            <span
              key={s.name}
              className="text-[10px] text-slate-400 bg-white/[0.05] border border-white/6 px-2 py-0.5 rounded-full truncate max-w-[140px]"
            >
              {s.name}
            </span>
          ))}
          {booking.services.length > 2 && (
            <span className="text-[10px] text-slate-500 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-full">
              +{booking.services.length - 2} more
            </span>
          )}
        </div>

        {/* Total + remove */}
        <div
          className="flex items-center justify-between pt-1 border-t border-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm font-bold text-amber-400 tabular-nums">
            {formatINR(booking.totalPrice)}
          </span>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Remove?</span>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(booking.id); }}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
