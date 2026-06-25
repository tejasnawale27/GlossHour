import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import {
  X,
  MapPin,
  CalendarPlus,
  Download,
  Sparkles,
} from "lucide-react";
import type { BookingRecord } from "../data/bookings";

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

interface BoardingPassModalProps {
  booking: BookingRecord;
  /** If provided, a header close button and backdrop are rendered (standalone modal mode). */
  onClose?: () => void;
  /** Called when "Add to Calendar" is clicked. If omitted, the function is built internally. */
  onAddToCalendar?: () => void;
  /** When true, renders inline (no backdrop/close button overlay). Default: false */
  inline?: boolean;
}

export default function BoardingPassModal({
  booking,
  onClose,
  onAddToCalendar,
  inline = false,
}: BoardingPassModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const qrValue = [
    `REF:${booking.id}`,
    `GUEST:${booking.guestName}`,
    `PHONE:+91${booking.guestPhone}`,
    `SALON:${booking.salonName}`,
    `LOCATION:${booking.salonLocality} Mumbai`,
    `DATE:${booking.dateLabel}`,
    `TIME:${booking.time}`,
    `TOTAL:${formatINR(booking.totalPrice)}`,
  ].join(" | ");

  const handleAddToCalendar = () => {
    if (onAddToCalendar) {
      onAddToCalendar();
      return;
    }
    const [year, month, day] = booking.date.split("-").map(Number);
    const [timePart, ampm] = booking.time.split(" ");
    const [h, m] = timePart.split(":").map(Number);
    const hour24 =
      ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h;
    const start = new Date(year, month - 1, day, hour24, m);
    const end = new Date(start.getTime() + booking.totalDuration * 60000);
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(`${booking.salonName} — GlossHour`)}` +
      `&dates=${fmt(start)}/${fmt(end)}` +
      `&details=${encodeURIComponent(
        `Booking ref: ${booking.id}\nServices: ${booking.services.map((s) => s.name).join(", ")}`
      )}` +
      `&location=${encodeURIComponent(booking.salonLocality + ", Mumbai")}`;
    window.open(url, "_blank", "noopener");
  };

  const downloadTicket = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ticketRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#1e1e2e",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `GlossHour-${booking.id}.png`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  const content = (
    <div className="flex flex-col items-center px-5 pt-6 pb-6 gap-5">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/30 mb-3">
          <Sparkles className="w-7 h-7 text-slate-950" strokeWidth={2.5} />
        </div>
        <h2 className="font-display text-xl text-white">
          {inline ? "Your Booking Pass" : "You're all set!"}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {inline
            ? "Show this pass at the salon on the day."
            : "Your booking is confirmed. Show this pass at the salon."}
        </p>
      </div>

      {/* Ticket card */}
      <div
        ref={ticketRef}
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10"
      >
        {/* Top half */}
        <div className="bg-gradient-to-br from-slate-800 to-[#1a1a2e] px-6 pt-5 pb-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-slate-950" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
                GlossHour
              </span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              Beauty Pass
            </span>
          </div>

          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-0.5">
              Salon
            </div>
            <div className="font-display text-lg text-white leading-tight">
              {booking.salonName}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-slate-400">
                {booking.salonLocality}, Mumbai
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mb-0.5">
                Date
              </div>
              <div className="text-sm font-semibold text-white leading-snug">
                {booking.dateLabel}
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mb-0.5">
                Time
              </div>
              <div className="text-sm font-semibold text-white">{booking.time}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mb-0.5">
                Duration
              </div>
              <div className="text-sm font-semibold text-white">
                {booking.totalDuration} min
              </div>
            </div>
          </div>
        </div>

        {/* Tear-away dashed line */}
        <div className="relative flex items-center" style={{ height: 0 }}>
          <div
            className="absolute -left-3 w-6 h-6 rounded-full bg-slate-900"
            style={{ border: "1px solid rgba(255,255,255,0.05)" }}
          />
          <div
            className="absolute -right-3 w-6 h-6 rounded-full bg-slate-900"
            style={{ border: "1px solid rgba(255,255,255,0.05)" }}
          />
          <div
            className="w-full mx-3"
            style={{ borderTop: "2px dashed rgba(255,255,255,0.12)" }}
          />
        </div>

        {/* Bottom half */}
        <div className="bg-[#1c1c2c] px-6 pt-5 pb-5">
          <div className="flex items-start gap-5">
            <div className="shrink-0 w-[76px] h-[76px] bg-white rounded-xl p-1.5 flex items-center justify-center">
              <QRCode
                value={qrValue}
                size={60}
                bgColor="#ffffff"
                fgColor="#0a0a14"
                level="M"
                style={{ display: "block" }}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-2.5">
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mb-0.5">
                  Booking ref
                </div>
                <div className="font-mono text-base font-bold text-amber-400 tracking-widest">
                  {booking.id}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mb-0.5">
                  Guest
                </div>
                <div className="text-sm text-white truncate">{booking.guestName}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mb-0.5">
                  Total paid
                </div>
                <div className="text-base font-bold text-white tabular-nums">
                  {formatINR(booking.totalPrice)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mb-1.5">
              Services included
            </div>
            <div className="flex flex-wrap gap-1.5">
              {booking.services.map((s) => (
                <span
                  key={s.name}
                  className="text-[10px] text-slate-300 bg-white/[0.06] border border-white/8 px-2 py-0.5 rounded-full"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        <button
          onClick={handleAddToCalendar}
          className="inline-flex items-center justify-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-slate-200 text-sm font-medium px-4 py-3 rounded-2xl transition-all active:scale-[0.97]"
        >
          <CalendarPlus className="w-4 h-4 text-amber-400" />
          Add to Calendar
        </button>
        <button
          onClick={downloadTicket}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-slate-200 text-sm font-medium px-4 py-3 rounded-2xl transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin text-amber-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeOpacity="0.25"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-amber-400" />
              Download Pass
            </>
          )}
        </button>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full max-w-sm bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
        >
          Done
        </button>
      )}
    </div>
  );

  if (inline) return content;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-slate-900 border border-white/8 rounded-3xl shadow-2xl shadow-black/70 animate-scale-in overflow-y-auto max-h-[90dvh] no-scrollbar">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {content}
      </div>
    </div>
  );
}
