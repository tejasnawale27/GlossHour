import { useState, useId } from "react";
import {
  X,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  Shield,
  CheckCircle2,
  User,
  Phone,
  Scissors,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react";
import type { Salon, Service } from "../data/salons";

interface BookingModalProps {
  salon: Salon | null;
  onClose: () => void;
  onConfirmed: (bookingId: string) => void;
}

/* ─── Static data ─────────────────────────────────────────── */

const DATES = Array.from({ length: 5 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return {
    key: d.toISOString().slice(0, 10),
    day: d.toLocaleDateString("en-IN", { weekday: "short" }),
    date: d.getDate(),
    month: d.toLocaleDateString("en-IN", { month: "short" }),
  };
});

const TIME_GROUPS = [
  {
    label: "Morning",
    icon: "🌤",
    slots: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
  },
  {
    label: "Afternoon",
    icon: "☀️",
    slots: ["12:00 PM", "12:30 PM", "1:00 PM", "2:00 PM", "3:00 PM", "3:30 PM"],
  },
  {
    label: "Evening",
    icon: "🌆",
    slots: ["4:00 PM", "5:00 PM", "5:30 PM", "6:00 PM", "7:00 PM", "7:30 PM"],
  },
];

const STEP_META = [
  { label: "Services", icon: Scissors },
  { label: "Schedule", icon: CalendarDays },
  { label: "Confirm", icon: ClipboardCheck },
];

/* ─── Helpers ─────────────────────────────────────────────── */

function genBookingId() {
  return "GH-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

/* ─── Main component ──────────────────────────────────────── */

export default function BookingModal({
  salon,
  onClose,
  onConfirmed,
}: BookingModalProps) {
  const uid = useId();

  /* wizard state */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  /* step-1 */
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set()
  );

  /* step-2 */
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  /* step-3 */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [phoneErr, setPhoneErr] = useState("");

  if (!salon) return null;

  /* ── derived ── */
  const chosenServices: Service[] = salon.services.filter((s) =>
    selectedServices.has(s.name)
  );
  const cartTotal = chosenServices.reduce((acc, s) => acc + s.price, 0);
  const totalDuration = chosenServices.reduce(
    (acc, s) => acc + s.durationMin,
    0
  );
  const dateObj = DATES.find((d) => d.key === selectedDate);

  /* ── handlers ── */
  const toggleService = (name: string) =>
    setSelectedServices((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const navigate = (to: 1 | 2 | 3) => {
    setDirection(to > step ? "forward" : "back");
    setStep(to);
  };

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    let ok = true;
    if (!name.trim()) { setNameErr("Name is required"); ok = false; }
    else setNameErr("");
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setPhoneErr("Enter a valid 10-digit Indian mobile number");
      ok = false;
    } else setPhoneErr("");
    if (!ok) return;
    onConfirmed(genBookingId());
    handleClose();
  };

  const canAdvance1 = selectedServices.size > 0;
  const canAdvance2 = !!selectedDate && !!selectedSlot;

  const animClass =
    direction === "forward" ? "animate-step-in" : "animate-step-back";

  /* ── render ── */
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        onClick={handleClose}
        aria-hidden
      />

      {/* Sheet / Dialog */}
      <div className="relative w-full sm:max-w-xl flex flex-col bg-slate-900 border border-white/8 rounded-t-3xl sm:rounded-3xl max-h-[96dvh] sm:max-h-[90vh] shadow-2xl shadow-black/70 animate-scale-in">

        {/* ── Hero banner ── */}
        <div className="relative h-36 sm:h-44 shrink-0 overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
          <img
            src={salon.image}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-slate-900/10" />

          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Salon info */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <div className="inline-flex items-center gap-1 bg-slate-950/60 backdrop-blur-sm border border-white/10 text-[11px] font-medium text-white px-2 py-1 rounded-full mb-1.5">
              <MapPin className="w-3 h-3 text-amber-400" />
              {salon.locality}
            </div>
            <div className="flex items-end justify-between gap-2">
              <h2 className="font-display text-xl sm:text-2xl text-white leading-tight">
                {salon.name}
              </h2>
              <div className="shrink-0 inline-flex items-center gap-1 pb-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-white">
                  {salon.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Step indicator ── */}
        <div className="shrink-0 px-5 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            {STEP_META.map((meta, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              const Icon = meta.icon;
              return (
                <div key={n} className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    disabled={n > step}
                    onClick={() => n < step && navigate(n as 1 | 2 | 3)}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                      done
                        ? "bg-amber-400 border-amber-400 text-slate-950 cursor-pointer hover:bg-amber-300"
                        : active
                        ? "bg-amber-400/15 border-amber-400/60 text-amber-400"
                        : "bg-white/[0.04] border-white/10 text-slate-500 cursor-default"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                    ) : (
                      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                    )}
                  </button>
                  <span
                    className={`text-xs font-medium transition-colors truncate ${
                      active
                        ? "text-amber-400"
                        : done
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {meta.label}
                  </span>
                  {i < STEP_META.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-1 transition-all ${
                        step > n ? "bg-amber-400/50" : "bg-white/8"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div key={step} className={`${animClass} px-5 py-5`}>

            {/* ═══════════════ STEP 1 ═══════════════ */}
            {step === 1 && (
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400 mb-3">
                  Select one or more services
                </p>
                <div className="space-y-2">
                  {salon.services.map((s) => {
                    const checked = selectedServices.has(s.name);
                    return (
                      <button
                        key={s.name}
                        onClick={() => toggleService(s.name)}
                        className={`w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
                          checked
                            ? "border-amber-400/50 bg-amber-400/[0.07] shadow-sm shadow-amber-400/5"
                            : "border-white/6 bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/10"
                        }`}
                      >
                        {/* checkbox */}
                        <div
                          className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            checked
                              ? "bg-amber-400 border-amber-400"
                              : "bg-white/5 border-white/15"
                          }`}
                        >
                          {checked && (
                            <svg viewBox="0 0 10 8" className="w-3 h-2.5" fill="none">
                              <path
                                d="M1 4l3 3 5-6"
                                stroke="#0a0a14"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>

                        {/* label */}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate transition-colors ${checked ? "text-white" : "text-slate-200"}`}>
                            {s.name}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {s.durationMin} min
                          </div>
                        </div>

                        {/* price */}
                        <span className={`shrink-0 text-sm font-semibold tabular-nums transition-colors ${checked ? "text-amber-400" : "text-slate-300"}`}>
                          {formatINR(s.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 2 ═══════════════ */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Date row */}
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-400 mb-3">
                    Choose a date
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {DATES.map((d) => {
                      const active = d.key === selectedDate;
                      return (
                        <button
                          key={d.key}
                          onClick={() => setSelectedDate(d.key)}
                          className={`flex flex-col items-center py-3 rounded-2xl border transition-all duration-200 ${
                            active
                              ? "border-amber-400/50 bg-amber-400/[0.08] shadow-sm shadow-amber-400/5"
                              : "border-white/6 bg-white/[0.025] hover:bg-white/[0.05]"
                          }`}
                        >
                          <span className={`text-[10px] uppercase tracking-wider ${active ? "text-amber-400" : "text-slate-500"}`}>
                            {d.day}
                          </span>
                          <span className={`text-lg font-bold mt-0.5 tabular-nums ${active ? "text-amber-400" : "text-white"}`}>
                            {d.date}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            {d.month}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time groups */}
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-400 mb-3">
                    Pick a time slot
                  </p>
                  <div className="space-y-4">
                    {TIME_GROUPS.map((group) => (
                      <div key={group.label}>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
                          <span>{group.icon}</span>
                          <span className="font-medium text-slate-300">{group.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.slots.map((slot) => {
                            const active = slot === selectedSlot;
                            return (
                              <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                                  active
                                    ? "border-amber-400/50 bg-amber-400/[0.08] text-amber-400"
                                    : "border-white/6 bg-white/[0.025] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 3 ═══════════════ */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Summary card */}
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
                      Booking summary
                    </p>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {/* Salon */}
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-400">Salon</span>
                      <span className="text-white font-medium text-right">{salon.name}</span>
                    </div>
                    {/* Locality */}
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-400">Location</span>
                      <span className="text-white">{salon.locality}</span>
                    </div>
                    {/* Date & Time */}
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-400">Date & Time</span>
                      <span className="text-white font-medium">
                        {dateObj
                          ? `${dateObj.day}, ${dateObj.date} ${dateObj.month}`
                          : "—"}{" "}
                        · {selectedSlot}
                      </span>
                    </div>
                    {/* Duration */}
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-400">Duration</span>
                      <span className="text-white">{totalDuration} min</span>
                    </div>
                    {/* Services */}
                    <div className="pt-1 border-t border-white/5">
                      {chosenServices.map((s) => (
                        <div
                          key={s.name}
                          className="flex justify-between gap-3 text-sm py-1"
                        >
                          <span className="text-slate-300 truncate">{s.name}</span>
                          <span className="text-slate-300 shrink-0 tabular-nums">
                            {formatINR(s.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Total */}
                    <div className="flex justify-between gap-3 pt-2 border-t border-white/5">
                      <span className="text-sm font-semibold text-white">Total</span>
                      <span className="text-base font-bold text-amber-400 tabular-nums">
                        {formatINR(cartTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor={`${uid}-name`}
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id={`${uid}-name`}
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); if (nameErr) setNameErr(""); }}
                      placeholder="e.g. Priya Sharma"
                      className={`w-full bg-white/[0.05] border rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${nameErr ? "border-rose-500/60 focus:ring-rose-500/20" : "border-white/8 focus:border-amber-400/40 focus:ring-amber-400/15"}`}
                    />
                  </div>
                  {nameErr && (
                    <p className="text-xs text-rose-400 mt-1">{nameErr}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor={`${uid}-phone`}
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    Mobile number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-400">+91</span>
                    </div>
                    <input
                      id={`${uid}-phone`}
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ""));
                        if (phoneErr) setPhoneErr("");
                      }}
                      placeholder="9876543210"
                      className={`w-full bg-white/[0.05] border rounded-xl pl-[4.5rem] pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${phoneErr ? "border-rose-500/60 focus:ring-rose-500/20" : "border-white/8 focus:border-amber-400/40 focus:ring-amber-400/15"}`}
                    />
                  </div>
                  {phoneErr && (
                    <p className="text-xs text-rose-400 mt-1">{phoneErr}</p>
                  )}
                </div>

                {/* Trust */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-amber-400/70" />
                  Free cancellation up to 4 hours before your slot
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky footer ── */}
        <div className="shrink-0 px-5 pb-6 pt-3 border-t border-white/5 bg-slate-900">
          {/* Cart total strip — visible only on step 1 */}
          {step === 1 && (
            <div className="flex items-center justify-between gap-3 mb-3 px-4 py-2.5 bg-white/[0.03] border border-white/6 rounded-xl">
              <div className="text-xs text-slate-400">
                {selectedServices.size === 0
                  ? "No services selected"
                  : `${selectedServices.size} service${selectedServices.size > 1 ? "s" : ""} · ${totalDuration} min`}
              </div>
              <div className="text-sm font-semibold text-amber-400 tabular-nums">
                {formatINR(cartTotal)}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => navigate((step - 1) as 1 | 2)}
                className="inline-flex items-center gap-1.5 bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 text-sm font-medium px-4 py-3.5 rounded-xl transition-colors border border-white/5"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                disabled={step === 1 ? !canAdvance1 : !canAdvance2}
                onClick={() => navigate((step + 1) as 2 | 3)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-3.5 rounded-xl transition-all ${
                  (step === 1 && !canAdvance1) || (step === 2 && !canAdvance2)
                    ? "bg-white/[0.06] text-slate-500 cursor-not-allowed"
                    : "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-500/20"
                }`}
              >
                {step === 1 ? "Choose Date & Time" : "Review Booking"}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-semibold px-4 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                Confirm Appointment · {formatINR(cartTotal)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
