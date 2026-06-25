import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import {
  Sparkles,
  X,
  Star,
  MapPin,
  ArrowUpRight,
  ChevronDown,
  Zap,
  Clock,
  SendHorizonal,
  ShieldAlert,
  Mic,
  MicOff,
} from "lucide-react";
import {
  AI_CHIPS,
  resolveAiResponse,
  parseIntent,
  type AiChip,
} from "../data/glossai";
import type { Salon } from "../data/salons";

/* ─── Types ───────────────────────────────────────────────── */

interface SalonResult {
  salon: Salon;
  reasoning: string;
  highlightedService: string;
}

interface Message {
  id: string;
  role: "user" | "ai";
  /** Full resolved text — used by the typewriter once skeleton is replaced */
  text?: string;
  salonResult?: SalonResult;
  /** True while the 1-second skeleton is showing */
  isLoading?: boolean;
  /** True while the typewriter is still running */
  isTyping?: boolean;
  /** The displayed portion during typewriting */
  displayedText?: string;
  isBounced?: boolean;
}

interface GlossAIConciergeProps {
  onBookNow: (salon: Salon) => void;
}

/* ─── Welcome message ─────────────────────────────────────── */

const WELCOME: Message = {
  id: "welcome",
  role: "ai",
  text: "Hello! I'm GlossAI, your personal beauty concierge for Mumbai. Ask me anything about salons, services, or pricing — or pick a quick query below.",
  displayedText:
    "Hello! I'm GlossAI, your personal beauty concierge for Mumbai. Ask me anything about salons, services, or pricing — or pick a quick query below.",
  isTyping: false,
};

/* ─── Typewriter speed (ms per character) ────────────────── */
const CHAR_DELAY = 18;

/* ─── SpeechRecognition browser shim ─────────────────────── */

// Minimal local typings — the lib.dom types aren't always present for these APIs
interface SpeechRecognitionResultItem {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionResultItem;
}
interface SpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: { length: number; [index: number]: SpeechRecognitionResult };
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onspeechend: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor })
      .SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor })
      .webkitSpeechRecognition ??
    null
  );
}

type MicState = "idle" | "listening" | "unsupported";

/* ─── useSpeechRecognition hook ───────────────────────────── */
function useSpeechRecognition(
  onTranscript: (t: string) => void,
  onFinalSubmit: (t: string) => void
) {
  const SRCtor = getSpeechRecognition();
  const supported = !!SRCtor;
  const [micState, setMicState] = useState<MicState>(
    supported ? "idle" : "unsupported"
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggle = useCallback(() => {
    if (!SRCtor) return;

    if (micState === "listening") {
      stop();
      return;
    }

    const rec = new SRCtor();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = true;
    recognitionRef.current = rec;

    rec.onstart = () => setMicState("listening");

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      onTranscript(final || interim);
    };

    rec.onspeechend = () => rec.stop();

    rec.onend = () => {
      setMicState("idle");
      // Grab current transcript from input and submit
      onFinalSubmit(""); // signal: submit whatever is in the input
    };

    rec.onerror = () => {
      setMicState("idle");
    };

    rec.start();
  }, [SRCtor, micState, stop, onTranscript, onFinalSubmit]);

  // Cleanup on unmount
  useEffect(() => () => { recognitionRef.current?.abort(); }, []);

  return { micState, toggle, stop };
}

/* ─── Main component ──────────────────────────────────────── */

export default function GlossAIConcierge({ onBookNow }: GlossAIConciergeProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  // Keep a ref so speech callbacks always see latest value
  const inputLatestRef = useRef("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  // Keep ref in sync with state
  useEffect(() => { inputLatestRef.current = input; }, [input]);

  /* Auto-scroll whenever messages change or panel opens */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, open]);

  /* Focus input when panel opens */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  /* Cleanup timers on unmount */
  useEffect(() => {
    const timers = typeTimers.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  /* ── Typewriter ── */
  const startTypewriter = useCallback(
    (msgId: string, fullText: string, onDone?: () => void) => {
      let i = 0;

      const tick = () => {
        i++;
        const slice = fullText.slice(0, i);
        const done = i >= fullText.length;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? { ...m, displayedText: slice, isTyping: !done }
              : m
          )
        );

        if (!done) {
          const t = setTimeout(tick, CHAR_DELAY);
          typeTimers.current.set(msgId, t);
        } else {
          typeTimers.current.delete(msgId);
          onDone?.();
        }
      };

      const t = setTimeout(tick, CHAR_DELAY);
      typeTimers.current.set(msgId, t);
    },
    []
  );

  /* ── Shared "dispatch AI response" after 1s skeleton ── */
  const dispatchResponse = useCallback(
    (
      skeletonId: string,
      text: string,
      salonResult?: SalonResult,
      isBounced = false
    ) => {
      // Replace skeleton with typing state (empty display text)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === skeletonId
            ? {
                ...m,
                isLoading: false,
                isTyping: true,
                text,
                displayedText: "",
                salonResult,
                isBounced,
              }
            : m
        )
      );

      // Start typewriter; unblock input when text finishes
      startTypewriter(skeletonId, text, () => {
        setBusy(false);
      });
    },
    [startTypewriter]
  );

  /* ── Handle quick chip click ── */
  const handleChip = (chip: AiChip) => {
    if (busy) return;
    setBusy(true);

    const userMsgId = `u-${Date.now()}`;
    const skeletonId = `ai-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text: chip.query },
      { id: skeletonId, role: "ai", isLoading: true },
    ]);

    setTimeout(() => {
      const { response, salon } = resolveAiResponse(chip.id);
      dispatchResponse(skeletonId, response.text, {
        salon,
        reasoning: response.reasoning,
        highlightedService: response.highlightedService,
      });
    }, 1000);
  };

  /* ── Core submit logic (shared by keyboard, button, speech) ── */
  const submitText = useCallback((trimmed: string) => {
    if (!trimmed || busy) return;
    setBusy(true);

    const userMsgId = `u-${Date.now()}`;
    const skeletonId = `ai-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text: trimmed },
      { id: skeletonId, role: "ai", isLoading: true },
    ]);

    setTimeout(() => {
      const result = parseIntent(trimmed);
      if (result.type === "bounced") {
        dispatchResponse(skeletonId, result.text, undefined, true);
      } else {
        dispatchResponse(
          skeletonId,
          result.text!,
          {
            salon: result.salon!,
            reasoning: result.reasoning!,
            highlightedService: result.highlightedService!,
          },
          false
        );
      }
    }, 1000);
  }, [busy, dispatchResponse]);

  /* ── Handle free-text submit ── */
  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || busy) return;
    setInput("");
    submitText(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ── Speech recognition wiring ── */
  const handleSpeechTranscript = useCallback((t: string) => {
    if (!t) return;
    setInput(t);
    inputLatestRef.current = t;
  }, []);

  const handleSpeechFinalSubmit = useCallback(() => {
    const val = inputLatestRef.current.trim();
    if (val) {
      // Small delay so the final transcript lands in state before submit fires
      setTimeout(() => {
        setInput((current) => {
          const trimmed = current.trim();
          if (trimmed) {
            // Trigger submit imperatively
            submitText(trimmed);
          }
          return "";
        });
      }, 120);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { micState, toggle: toggleMic } = useSpeechRecognition(
    handleSpeechTranscript,
    handleSpeechFinalSubmit
  );

  const clearChat = () => {
    typeTimers.current.forEach((t) => clearTimeout(t));
    typeTimers.current.clear();
    setMessages([WELCOME]);
    setBusy(false);
    setInput("");
  };

  /* ── Render ── */
  return (
    <>
      {/* ── FAB ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle GlossAI Concierge"
        className={`fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl shadow-black/50 transition-all duration-300 ${
          open
            ? "bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700"
            : "bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 hover:scale-105 active:scale-95"
        }`}
      >
        {open ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <div className="relative">
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span className="absolute -inset-1 rounded-full animate-ping bg-amber-400/40 group-hover:hidden" />
          </div>
        )}
        <span className="text-sm font-semibold whitespace-nowrap">
          {open ? "Minimise" : "GlossAI Concierge"}
        </span>
      </button>

      {/* ── Panel ───────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[430px] max-h-[calc(100dvh-8rem)] flex flex-col bg-slate-900 border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/70 animate-panel-in overflow-hidden">

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
                    displayedText={msg.displayedText ?? ""}
                    isTyping={!!msg.isTyping}
                    isBounced={!!msg.isBounced}
                    salonResult={msg.salonResult}
                    onBookNow={onBookNow}
                  />
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Chat input */}
          <div className="shrink-0 border-t border-white/5 px-4 pt-3 pb-3 bg-slate-900/90">
            {/* Listening banner */}
            {micState === "listening" && (
              <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-mic-pulse shrink-0" />
                <span className="text-xs text-rose-400 font-medium">Listening… speak now</span>
                <span className="ml-auto flex gap-0.5 items-end h-3.5">
                  {[0,1,2,3,4].map((i) => (
                    <span
                      key={i}
                      className="w-0.5 rounded-full bg-rose-400 animate-sound-bar"
                      style={{ animationDelay: `${i * 0.1}s`, height: "100%" }}
                    />
                  ))}
                </span>
              </div>
            )}

            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={busy || micState === "listening"}
                placeholder={
                  micState === "listening"
                    ? "Transcribing your voice…"
                    : busy
                    ? "GlossAI is thinking…"
                    : "Ask about salons, services, pricing…"
                }
                className="flex-1 resize-none bg-white/[0.06] border border-white/8 rounded-2xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/15 transition-all disabled:opacity-60 max-h-28 leading-relaxed"
                style={{ scrollbarWidth: "none" }}
              />

              {/* Mic button — hidden when unsupported */}
              {micState !== "unsupported" && (
                <button
                  onClick={toggleMic}
                  disabled={busy}
                  title={micState === "listening" ? "Stop recording" : "Speak your query"}
                  className={`relative shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 ${
                    micState === "listening"
                      ? "bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/40"
                      : "bg-white/[0.08] hover:bg-white/[0.14] text-slate-400 hover:text-white border border-white/8"
                  }`}
                >
                  {micState === "listening" ? (
                    <>
                      <MicOff className="w-4 h-4" strokeWidth={2.5} />
                      {/* outer pulse ring */}
                      <span className="absolute inset-0 rounded-xl border-2 border-rose-500 animate-mic-ring" />
                    </>
                  ) : (
                    <Mic className="w-4 h-4" strokeWidth={2.5} />
                  )}
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={!input.trim() || busy || micState === "listening"}
                className="shrink-0 w-10 h-10 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-amber-500/20"
              >
                <SendHorizonal className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Quick-query chips */}
          <div className="shrink-0 border-t border-white/5 px-4 pt-3 pb-4 bg-slate-900/80">
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Quick queries
            </p>
            <div className="flex flex-col gap-1.5">
              {AI_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => handleChip(chip)}
                  disabled={busy}
                  className={`text-left text-xs px-3.5 py-2.5 rounded-xl border transition-all duration-200 leading-relaxed ${
                    busy
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

/* ─── Sub-components ──────────────────────────────────────── */

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
    <div className="flex items-start gap-2.5 animate-msg-pop">
      <AiAvatar pulse />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-white/[0.07] rounded-full w-[88%] animate-pulse" />
        <div className="h-3 bg-white/[0.07] rounded-full w-[72%] animate-pulse" />
        <div className="h-3 bg-white/[0.07] rounded-full w-[80%] animate-pulse" />
        <div className="h-3 bg-white/[0.07] rounded-full w-[55%] animate-pulse" />
        <div className="mt-3 h-[88px] bg-white/[0.04] rounded-2xl border border-white/5 animate-pulse" />
      </div>
    </div>
  );
}

function AiBubble({
  displayedText,
  isTyping,
  isBounced,
  salonResult,
  onBookNow,
}: {
  displayedText: string;
  isTyping: boolean;
  isBounced: boolean;
  salonResult?: SalonResult;
  onBookNow: (s: Salon) => void;
}) {
  return (
    <div className="flex items-start gap-2.5 animate-msg-pop">
      <AiAvatar />
      <div className="flex-1 min-w-0">
        {isBounced ? (
          <div className="flex items-start gap-2 bg-rose-500/[0.07] border border-rose-500/20 rounded-2xl rounded-tl-sm px-3.5 py-3">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-200 leading-relaxed">
              {displayedText}
              {isTyping && <Cursor />}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-200 leading-relaxed">
              {/* Render **bold** markdown spans in AI text */}
              {renderBold(displayedText)}
              {isTyping && <Cursor />}
            </p>
            {/* Only show salon card once typing is done */}
            {!isTyping && salonResult && (
              <MatchedSalonCard
                salon={salonResult.salon}
                reasoning={salonResult.reasoning}
                highlightedService={salonResult.highlightedService}
                onBookNow={onBookNow}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Cursor() {
  return (
    <span className="inline-block w-[2px] h-[1em] bg-amber-400 ml-0.5 align-middle animate-pulse rounded-full" />
  );
}

/** Renders **text** as <strong> */
function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function AiAvatar({ pulse }: { pulse?: boolean }) {
  return (
    <div
      className={`shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow shadow-amber-500/30 ${
        pulse ? "animate-pulse" : ""
      }`}
    >
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
    <div className="mt-3 rounded-2xl overflow-hidden border border-amber-400/25 bg-gradient-to-br from-amber-400/[0.06] to-transparent shadow-lg shadow-amber-400/5 animate-msg-pop">
      <div className="h-0.5 bg-gradient-to-r from-amber-400 via-amber-300 to-transparent" />

      <div className="flex items-center gap-3 p-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 ring-1 ring-amber-400/20">
          <img
            src={salon.image}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1">
            <Sparkles className="w-2.5 h-2.5" />
            AI Best Match
          </div>
          <div className="text-sm font-semibold text-white truncate leading-tight">
            {salon.name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400 truncate">{salon.locality}</span>
            <span className="text-slate-600">·</span>
            <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-xs font-medium text-white tabular-nums">
              {salon.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-3 pb-2">
        <div className="text-[10px] text-amber-400/80 bg-amber-400/[0.06] border border-amber-400/15 rounded-lg px-2.5 py-1.5 leading-relaxed">
          <span className="font-semibold">Why this match:</span> {reasoning}
        </div>
      </div>

      {service && (
        <div className="mx-3 mb-3 flex items-center justify-between gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
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
