import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Star,
  MapPin,
  ArrowUpRight,
  ChevronDown,
  Zap,
  Clock,
} from "lucide-react";
import { AI_CHIPS, resolveAiResponse, type AiChip } from "../data/glossai";
import type { Salon } from "../data/salons";

interface Message {
  id: string;
  role: "user" | "ai";
  text?: string;
  chipId?: string;
  salonResult?: {
    salon: Salon;
    reasoning: string;
    highlightedService: string;
  };
  isLoading?: boolean;
}

interface GlossAIConciergeProps {
  onBookNow: (salon: Salon) => void;
}

const WELCOME: Message = {
  id: "welcome",
  role: "ai",
  text: "Hello! I'm GlossAI, your personal beauty concierge for Mumbai. Ask me to find the perfect salon match, compare pricing, or check availability — I'll surface the best option from our curated network instantly.",
};

export default function GlossAIConcierge({ onBookNow }: GlossAIConciergeProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [loadingChipId, setLoadingChipId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [open, messages]);

  const handleChip = (chip: AiChip) => {
    if (loadingChipId) return;

    const userMsgId = `user-${Date.now()}`;
    const skeletonId = `skeleton-${Date.now()}`;

    // Push user bubble + skeleton immediately
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text: chip.query, chipId: chip.id },
      { id: skeletonId, role: "ai", isLoading: true },
    ]);
    setLoadingChipId(chip.id);

    // After 1 s, replace skeleton with real response
    setTimeout(() => {
      const { response, salon } = resolveAiResponse(chip.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === skeletonId
            ? {
                id: skeletonId,
                role: "ai",
                text: response.text,
                salonResult: {
                  salon,
                  reasoning: response.reasoning,
                  highlightedService: response.highlightedService,
                },
              }
            : m
        )
      );
      setLoadingChipId(null);
    }, 1100);
  };

  const clearChat = () => {
    setMessages([WELCOME]);
    setLoadingChipId(null);
  };

  return (
    <>
      {/* ── FAB ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open GlossAI Concierge"
        className={`fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl shadow-black/50 transition-all duration-300 ${
          open
            ? "bg-slate-800 border border-white/10 text-slate-300"
            : "bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 hover:scale-105 active:scale-95"
        }`}
      >
        {open ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <>
            <div className="relative">
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              {/* pulse ring */}
              <span className="absolute -inset-1 rounded-full animate-ping bg-amber-400/40 group-hover:hidden" />
            </div>
          </>
        )}
        <span className="text-sm font-semibold whitespace-nowrap">
          {open ? "Minimise" : "GlossAI Concierge"}
        </span>
      </button>

      {/* ── Panel ── */}
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[calc(100dvh-8rem)] flex flex-col bg-slate-900 border border-white/8 rounded-3xl shadow-2xl shadow-black/70 animate-panel-in overflow-hidden">

          {/* Header */}
          <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-white/5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Sparkles className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white leading-tight">
                  GlossAI Concierge
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-[10px] text-emerald-400">
                    Online · Mumbai marketplace
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === "user" ? (
                  <UserBubble text={msg.text!} />
                ) : msg.isLoading ? (
                  <SkeletonBubble />
                ) : (
                  <AiBubble
                    text={msg.text!}
                    salonResult={msg.salonResult}
                    onBookNow={(salon) => {
                      onBookNow(salon);
                    }}
                  />
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick-query chips */}
          <div className="shrink-0 border-t border-white/5 px-4 py-4 bg-slate-900/80">
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Quick queries
            </p>
            <div className="flex flex-col gap-2">
              {AI_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => handleChip(chip)}
                  disabled={!!loadingChipId}
                  className={`text-left text-xs px-3.5 py-2.5 rounded-xl border transition-all duration-200 leading-relaxed ${
                    loadingChipId === chip.id
                      ? "border-amber-400/40 bg-amber-400/[0.06] text-amber-300"
                      : loadingChipId
                      ? "border-white/4 bg-white/[0.015] text-slate-500 cursor-not-allowed"
                      : "border-white/8 bg-white/[0.025] text-slate-300 hover:bg-white/[0.06] hover:border-amber-400/30 hover:text-white"
                  }`}
                >
                  <span className="text-amber-400/70 mr-1.5">✦</span>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Sub-components ────────────────────────────────────────── */

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] bg-amber-400/[0.12] border border-amber-400/20 text-slate-100 text-sm leading-relaxed px-4 py-3 rounded-2xl rounded-tr-sm animate-msg-pop">
        {text}
      </div>
    </div>
  );
}

function SkeletonBubble() {
  return (
    <div className="flex items-start gap-2.5">
      <AiAvatar pulse />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-white/[0.06] rounded-full w-[90%] animate-pulse" />
        <div className="h-3 bg-white/[0.06] rounded-full w-[75%] animate-pulse" />
        <div className="h-3 bg-white/[0.06] rounded-full w-[85%] animate-pulse" />
        <div className="h-3 bg-white/[0.06] rounded-full w-[60%] animate-pulse" />
        {/* skeleton card */}
        <div className="mt-3 h-24 bg-white/[0.04] rounded-2xl border border-white/5 animate-pulse" />
      </div>
    </div>
  );
}

function AiBubble({
  text,
  salonResult,
  onBookNow,
}: {
  text: string;
  salonResult?: {
    salon: Salon;
    reasoning: string;
    highlightedService: string;
  };
  onBookNow: (s: Salon) => void;
}) {
  return (
    <div className="flex items-start gap-2.5 animate-msg-pop">
      <AiAvatar />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 leading-relaxed">{text}</p>

        {salonResult && (
          <MatchedSalonCard
            salon={salonResult.salon}
            reasoning={salonResult.reasoning}
            highlightedService={salonResult.highlightedService}
            onBookNow={onBookNow}
          />
        )}
      </div>
    </div>
  );
}

function AiAvatar({ pulse }: { pulse?: boolean }) {
  return (
    <div className={`shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow shadow-amber-500/30 ${pulse ? "animate-pulse" : ""}`}>
      <Sparkles className="w-3.5 h-3.5 text-slate-950" strokeWidth={2.5} />
    </div>
  );
}

function MatchedSalonCard({
  salon,
  reasoning,
  highlightedService,
  onBookNow,
}: {
  salon: Salon;
  reasoning: string;
  highlightedService: string;
  onBookNow: (s: Salon) => void;
}) {
  const service = salon.services.find((s) => s.name === highlightedService);

  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-amber-400/25 bg-gradient-to-br from-amber-400/[0.06] to-transparent shadow-lg shadow-amber-400/5">
      {/* Accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-amber-400 via-amber-300 to-transparent" />

      {/* Image + name row */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 ring-1 ring-amber-400/20">
          <img
            src={salon.image}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          {/* AI match badge */}
          <div className="inline-flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1">
            <Sparkles className="w-2.5 h-2.5" />
            AI Best Match
          </div>
          <div className="text-sm font-semibold text-white truncate leading-tight">
            {salon.name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400 truncate">
              {salon.locality}
            </span>
            <span className="text-slate-600">·</span>
            <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-xs font-medium text-white tabular-nums">
              {salon.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="px-3 pb-2">
        <div className="text-[10px] text-amber-400/80 bg-amber-400/[0.06] border border-amber-400/15 rounded-lg px-2.5 py-1.5 leading-relaxed">
          <span className="font-semibold">Why this match:</span> {reasoning}
        </div>
      </div>

      {/* Highlighted service */}
      {service && (
        <div className="mx-3 mb-3 flex items-center justify-between gap-2 bg-white/[0.03] border border-white/6 rounded-xl px-3 py-2">
          <div className="min-w-0">
            <div className="text-[11px] text-amber-400/80 font-medium">
              Recommended service
            </div>
            <div className="text-xs text-white truncate mt-0.5">
              {service.name}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs font-bold text-white tabular-nums">
              ₹{service.price.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-slate-400 justify-end mt-0.5">
              <Clock className="w-2.5 h-2.5" />
              {service.durationMin} min
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="px-3 pb-3">
        <button
          onClick={() => onBookNow(salon)}
          className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-amber-500/20"
        >
          Book This Salon
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
