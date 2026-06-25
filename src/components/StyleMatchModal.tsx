import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Sparkles,
  Clock,
  IndianRupee,
  ImageOff,
} from "lucide-react";
import type { Salon } from "../data/salons";
import SalonCard from "./SalonCard";

type ModalState = "upload" | "scanning" | "results";

interface StyleResult {
  detectedLook: string;
  timeRequired: string;
  priceRange: string;
  recommendation: string;
  matchedSalonIds: string[];
}

const DEMO_IMAGES = [
  {
    id: "balayage",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
    label: "Balayage Hair",
  },
  {
    id: "bridal",
    url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=400&q=80",
    label: "Bridal Makeup",
  },
  {
    id: "nails",
    url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80",
    label: "Nail Art",
  },
];

const STYLE_MATCHES: Record<string, StyleResult> = {
  balayage: {
    detectedLook: "Sunlit Balayage & Keratin Smooth Finish",
    timeRequired: "Approx. 2.5 - 3 hours",
    priceRange: "₹6,500 - ₹9,500",
    recommendation:
      "This look needs an expert colorist for seamless blending. We recommend a consultation first.",
    matchedSalonIds: ["naturals-juhu", "jeansebastian-worli"],
  },
  bridal: {
    detectedLook: "Couture Bridal Updo & HD Airbrush Makeup",
    timeRequired: "Approx. 3 - 4 hours",
    priceRange: "₹12,000 - ₹18,500",
    recommendation:
      "This requires an expert bridal MUA with HD airbrush experience. Book at least 2 weeks ahead.",
    matchedSalonIds: ["lakme-bandra", "yss-malad"],
  },
  nails: {
    detectedLook: "Custom Chrome Nail Art & Spa Pedicure",
    timeRequired: "Approx. 2 - 2.5 hours",
    priceRange: "₹2,800 - ₹4,200",
    recommendation:
      "Chrome finishes need a skilled nail artist. Perfect for special occasions.",
    matchedSalonIds: ["haus-of-nails-juhu", "lakme-bandra"],
  },
};

interface StyleMatchModalProps {
  salons: Salon[];
  onBookNow: (salon: Salon) => void;
  onClose: () => void;
}

export default function StyleMatchModal({
  salons,
  onBookNow,
  onClose,
}: StyleMatchModalProps) {
  const [state, setState] = useState<ModalState>("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [result, setResult] = useState<StyleResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const matchedSalons = result
    ? salons.filter((s) => result.matchedSalonIds.includes(s.id))
    : [];

  const handleDemoSelect = (demoId: string) => {
    const demo = DEMO_IMAGES.find((d) => d.id === demoId);
    if (!demo) return;
    setSelectedImage(demo.url);
    startScanning(demo.id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setSelectedImage(url);
    startScanning("balayage"); // Default to balayage match for uploads
  };

  const startScanning = (matchId: string) => {
    setState("scanning");
    setTimeout(() => {
      const match = STYLE_MATCHES[matchId] || STYLE_MATCHES.balayage;
      setResult(match);
      setState("results");
    }, 2500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setSelectedImage(url);
    startScanning("bridal");
  };

  useEffect(() => {
    return () => {
      if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    };
  }, [uploadedImage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/80 animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles className="w-5 h-5 text-slate-950" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-display text-lg text-white leading-tight">
                Vision AI StyleMatch
              </h2>
              <p className="text-xs text-slate-400">
                Find your perfect look with AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {state === "upload" && (
            <div className="space-y-5">
              {/* Upload zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-white/15 hover:border-amber-400/50 rounded-2xl p-8 text-center transition-colors cursor-pointer bg-white/[0.01] group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400/10 flex items-center justify-center mb-4 group-hover:bg-amber-400/20 transition-colors">
                  <Upload className="w-6 h-6 text-amber-400" strokeWidth={2} />
                </div>
                <p className="text-sm text-slate-300 font-medium mb-1">
                  Upload an inspiration photo
                </p>
                <p className="text-xs text-slate-500">
                  Drag & drop or click to browse
                </p>
              </div>

              {/* Demo images */}
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500 mb-3">
                  Demo Inspirations
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {DEMO_IMAGES.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => handleDemoSelect(demo.id)}
                      className="relative group rounded-xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-all"
                    >
                      <img
                        src={demo.url}
                        alt={demo.label}
                        className="w-full h-24 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                      <span className="absolute bottom-2 left-2 right-2 text-[11px] font-medium text-white truncate">
                        {demo.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {state === "scanning" && selectedImage && (
            <div className="space-y-5">
              {/* Image with laser scan */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={selectedImage}
                  alt="Analyzing"
                  className="w-full h-72 object-cover"
                />
                {/* Laser line */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-laser-scan shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-slate-950/30" />
                {/* HUD corners */}
                <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-amber-400/60 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-amber-400/60 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-amber-400/60 rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-amber-400/60 rounded-br-lg" />
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-sm text-amber-400 font-medium">
                  Analyzing your look...
                </span>
              </div>
            </div>
          )}

          {state === "results" && result && (
            <div className="space-y-5">
              {/* Results card */}
              <div className="bg-gradient-to-br from-amber-400/[0.06] to-transparent border border-amber-400/25 rounded-2xl p-5 animate-fade-in-up">
                <div className="flex items-start gap-3 mb-4">
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-amber-400/20 flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-amber-400/80 mb-0.5">
                      Detected Look
                    </p>
                    <p className="text-base font-semibold text-white leading-snug">
                      {result.detectedLook}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-slate-500 mb-0.5">
                      <Clock className="w-3 h-3" />
                      Time Required
                    </div>
                    <p className="text-sm font-medium text-white">
                      {result.timeRequired}
                    </p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-slate-500 mb-0.5">
                      <IndianRupee className="w-3 h-3" />
                      Price Range
                    </div>
                    <p className="text-sm font-medium text-white">
                      {result.priceRange}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/60 rounded-xl px-4 py-3 border border-white/5">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-amber-400 font-medium">AI Recommendation:</span>{" "}
                    {result.recommendation}
                  </p>
                </div>
              </div>

              {/* Matched salons */}
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500 mb-3">
                  Best Matches for This Look
                </p>
                <div className="space-y-4">
                  {matchedSalons.map((salon, i) => (
                    <SalonCard
                      key={salon.id}
                      salon={salon}
                      index={i}
                      onCheckAvailability={onBookNow}
                    />
                  ))}
                </div>
              </div>

              {/* Try another */}
              <button
                onClick={() => {
                  setState("upload");
                  setSelectedImage(null);
                  setResult(null);
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors"
              >
                <ImageOff className="w-4 h-4" />
                Try Another Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
