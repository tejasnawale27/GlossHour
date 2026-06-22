import { useEffect } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

interface ToastProps {
  bookingId: string;
  onDone: () => void;
}

export default function Toast({ bookingId, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-[calc(100vw-2rem)] max-w-md"
      role="alert"
    >
      <div className="animate-toast-in flex items-start gap-3.5 bg-slate-900 border border-amber-400/30 rounded-2xl px-4 py-4 shadow-2xl shadow-black/60">
        {/* glow ring */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-amber-400" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white leading-tight">
              Appointment scheduled successfully!
            </p>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Booking ID{" "}
            <span className="text-amber-400 font-mono font-medium tabular-nums">
              {bookingId}
            </span>{" "}
            sent to your phone.
          </p>
        </div>

        {/* progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl overflow-hidden">
          <div className="h-full bg-amber-400/60 animate-toast-bar" />
        </div>
      </div>
    </div>
  );
}
