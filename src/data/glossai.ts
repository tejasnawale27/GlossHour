import { SALONS, type Salon } from "./salons";

/* ─── Chip types (unchanged) ──────────────────────────────── */

export interface AiChip {
  id: string;
  label: string;
  query: string;
}

export interface AiResponse {
  text: string;
  reasoning: string;
  matchedSalonId: string;
  highlightedService: string;
}

export const AI_CHIPS: AiChip[] = [
  {
    id: "bridal-bandra",
    label: "Top bridal makeup specialist in Bandra",
    query: "Recommend a top bridal makeup specialist in Bandra",
  },
  {
    id: "hair-budget",
    label: "High-rated hair salons under ₹1,500",
    query: "Show me high-rated hair salons with pricing under ₹1500",
  },
  {
    id: "spa-juhu",
    label: "Open luxury spa slot near Juhu tonight",
    query: "Find an open luxury spa slot for tonight near Juhu",
  },
];

const CHIP_RESPONSES: Record<AiChip["id"], AiResponse> = {
  "bridal-bandra": {
    text: "Based on your request, I've scanned all 12 curated salons across Mumbai and cross-referenced bridal expertise scores, recency of reviews, and proximity to Bandra. Lakmé Absolute Salon in Bandra West scores highest — a 4.9-star flagship atelier with a dedicated Bridal Makeup Trial and an Airbrush artistry team. Their 2,143 reviews consistently mention flawless longevity. I'm holding a preferred slot for you.",
    reasoning: "4.9 ★ · Bridal Makeup primary category · Bandra West locality",
    matchedSalonId: "lakme-bandra",
    highlightedService: "Bridal Makeup Trial",
  },
  "hair-budget": {
    text: "I filtered our inventory for salons with a 4.6+ star rating whose hair service menu includes at least one option priced at or below ₹1,500. Naturals Lounge in Juhu tops the shortlist — their Precision Haircut is just ₹1,200 and their Hair Spa & Scalp Detox comes in at ₹1,500, both with a 4.7 overall rating. Great value for a sea-facing neighbourhood studio.",
    reasoning: "4.7 ★ · Precision Haircut ₹1,200 · Hair Spa ₹1,500",
    matchedSalonId: "naturals-juhu",
    highlightedService: "Precision Haircut",
  },
  "spa-juhu": {
    text: "Scanning for 'Luxury Spa' category salons within the Juhu–Churchgate corridor with same-day evening availability signals. Spacifique Wellness at Churchgate checks every box — a 4.9-star rating, Balinese Full Body Spa at ₹6,800, and confirmed open slots after 6 PM tonight. Their De-Stress Head Therapy (₹2,200, 40 min) is also perfect if you're short on time.",
    reasoning: "4.9 ★ · Luxury Spa · Evening slots confirmed open",
    matchedSalonId: "spacifique-churchgate",
    highlightedService: "Balinese Full Body Spa",
  },
};

export function resolveAiResponse(chipId: string): {
  response: AiResponse;
  salon: Salon;
} {
  const response = CHIP_RESPONSES[chipId];
  const salon = SALONS.find((s) => s.id === response.matchedSalonId)!;
  return { response, salon };
}

/* ─── Free-text Intent Parser ─────────────────────────────── */

export const DOMAIN_BOUNCER_MSG =
  "✨ I am GlossAI, your luxury beauty concierge. I only assist with finding and booking premium salons in Mumbai. How can I help you find your perfect treatment today?";

// Keywords that confirm a message is in-domain
const DOMAIN_KEYWORDS = [
  // services
  "hair", "haircut", "hairstyle", "colour", "color", "balayage", "keratin",
  "blowout", "blow dry", "highlights", "bridal", "bride", "wedding", "makeup",
  "makeover", "foundation", "eyebrow", "lash", "facial", "face", "skin",
  "skincare", "glow", "brightening", "hydra", "peel", "derma", "acne",
  "nail", "nails", "manicure", "pedicure", "gel", "acrylic", "extensions",
  "spa", "massage", "aromatherapy", "therapy", "relaxation", "wellness",
  "body", "wax", "waxing", "threading", "eyebrows",
  // price signals
  "cheap", "affordable", "budget", "price", "cost", "₹", "expensive",
  "luxury", "premium", "elite", "high-end", "under",
  // locations
  "mumbai", "bandra", "juhu", "colaba", "andheri", "worli", "lower parel",
  "churchgate", "thane", "malad", "goregaon", "borivali", "powai",
  // booking
  "book", "booking", "appointment", "slot", "available", "availability",
  "tonight", "today", "tomorrow", "schedule", "reserve",
  // salon generic
  "salon", "parlour", "parlor", "beauty", "treatment", "service",
  "recommend", "suggest", "find", "show", "best", "top", "rated",
];

interface IntentSignals {
  services: string[];    // matched service keywords
  localities: string[];  // matched locality keywords
  wantsCheap: boolean;
  wantsLuxury: boolean;
  maxPrice: number | null;
}

function extractIntents(q: string): IntentSignals {
  const lower = q.toLowerCase();

  const SERVICE_GROUPS: Record<string, string[]> = {
    bridal:   ["bridal", "bride", "wedding", "airbrush"],
    hair:     ["hair", "haircut", "balayage", "keratin", "colour", "color", "highlights", "blowout", "blow dry", "hairstyle"],
    skincare: ["facial", "face", "skin", "skincare", "glow", "brightening", "hydra", "peel", "derma"],
    nail:     ["nail", "nails", "manicure", "pedicure", "gel", "acrylic"],
    spa:      ["spa", "massage", "aromatherapy", "therapy", "relaxation", "wellness"],
  };

  const LOCALITY_MAP: Record<string, string> = {
    bandra:       "Bandra West",
    juhu:         "Juhu",
    colaba:       "Colaba",
    andheri:      "Andheri West",
    worli:        "Worli",
    "lower parel":"Lower Parel",
    churchgate:   "Churchgate",
    thane:        "Thane",
    malad:        "Malad",
    goregaon:     "Goregaon",
  };

  const services: string[] = [];
  for (const [group, kws] of Object.entries(SERVICE_GROUPS)) {
    if (kws.some((kw) => lower.includes(kw))) services.push(group);
  }

  const localities: string[] = [];
  for (const [kw, name] of Object.entries(LOCALITY_MAP)) {
    if (lower.includes(kw)) localities.push(name);
  }

  const wantsCheap  = /cheap|budget|affordable|under|low[\s-]?price/.test(lower);
  const wantsLuxury = /luxury|premium|elite|high[\s-]?end|best|top/.test(lower);

  // Extract explicit price ceiling e.g. "under 1500" or "₹1500"
  const priceMatch = lower.match(/(?:under|below|less than|<|₹)[\s₹]*(\d{3,5})/);
  const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;

  return { services, localities, wantsCheap, wantsLuxury, maxPrice };
}

// Score a salon against extracted intent signals
function scoreSalon(salon: Salon, intents: IntentSignals): number {
  let score = 0;

  // Locality match — highest weight
  for (const loc of intents.localities) {
    if (salon.locality.toLowerCase().includes(loc.toLowerCase())) score += 40;
  }

  // Service / category match
  const catLower = salon.primaryCategory.toLowerCase();
  const svcNames = salon.services.map((s) => s.name.toLowerCase()).join(" ");
  for (const svc of intents.services) {
    if (catLower.includes(svc) || svcNames.includes(svc)) score += 20;
  }

  // Price filters
  if (intents.maxPrice !== null) {
    const cheapestSvc = Math.min(...salon.services.map((s) => s.price));
    if (cheapestSvc <= intents.maxPrice) score += 15;
  }

  if (intents.wantsCheap) {
    const tier = salon.priceRange;
    if (tier === "₹₹") score += 10;
    else if (tier === "₹₹₹") score += 5;
  }

  if (intents.wantsLuxury) {
    if (salon.priceRange === "₹₹₹₹") score += 10;
    score += salon.rating;
  }

  // Base rating bonus
  score += salon.rating * 2;

  return score;
}

// Pick best highlighted service for the matched salon given intent
function pickService(salon: Salon, intents: IntentSignals): string {
  const svcKeywords: Record<string, string[]> = {
    bridal:   ["bridal", "bride", "wedding", "airbrush"],
    hair:     ["hair", "cut", "colour", "color", "keratin", "balayage"],
    skincare: ["facial", "skin", "glow", "peel", "derma"],
    nail:     ["nail", "manicure", "pedicure"],
    spa:      ["spa", "massage", "aromatherapy", "therapy"],
  };

  for (const svcGroup of intents.services) {
    const kws = svcKeywords[svcGroup] ?? [];
    const match = salon.services.find((s) =>
      kws.some((kw) => s.name.toLowerCase().includes(kw))
    );
    if (match) return match.name;
  }

  // Cheapest if price-sensitive
  if (intents.wantsCheap || intents.maxPrice !== null) {
    return [...salon.services].sort((a, b) => a.price - b.price)[0].name;
  }

  return salon.services[0].name;
}

export interface FreeTextResult {
  type: "match" | "bounced";
  text: string;
  salon?: Salon;
  reasoning?: string;
  highlightedService?: string;
}

export function parseIntent(query: string): FreeTextResult {
  const lower = query.toLowerCase().trim();

  // Domain bouncer — reject if no domain keyword matches
  const inDomain = DOMAIN_KEYWORDS.some((kw) => lower.includes(kw));
  if (!inDomain) {
    return { type: "bounced", text: DOMAIN_BOUNCER_MSG };
  }

  const intents = extractIntents(lower);

  // Score every salon and pick the winner
  const scored = SALONS.map((s) => ({ salon: s, score: scoreSalon(s, intents) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0].salon;
  const highlightedService = pickService(best, intents);
  const service = best.services.find((s) => s.name === highlightedService)!;

  // Build prose reasoning line
  const whyParts: string[] = [];
  if (intents.localities.length) whyParts.push(`near ${intents.localities[0]}`);
  if (intents.services.length)  whyParts.push(`${intents.services[0]} expertise`);
  if (intents.maxPrice)          whyParts.push(`service from ₹${service.price.toLocaleString("en-IN")}`);
  if (intents.wantsLuxury)      whyParts.push(`${best.priceRange} tier`);
  whyParts.push(`${best.rating} ★`);
  const reasoning = whyParts.join(" · ");

  // Compose reply text
  const locPhrase = intents.localities.length
    ? ` in ${intents.localities.join(" / ")}`
    : " across Mumbai";
  const svcPhrase = intents.services.length
    ? ` for ${intents.services.join(" & ")}`
    : "";

  const text = `I've searched our curated network${locPhrase}${svcPhrase} and found your ideal match. **${best.name}** (${best.locality}) leads with a ${best.rating}-star rating and ${best.reviewCount.toLocaleString("en-IN")} verified reviews. Their ${highlightedService} starts at ₹${service.price.toLocaleString("en-IN")} — I've highlighted the details below so you can book instantly.`;

  return {
    type: "match",
    text,
    salon: best,
    reasoning,
    highlightedService,
  };
}
