import { SALONS, type Salon } from "./salons";

export interface AiChip {
  id: string;
  label: string;
  query: string;
}

export interface AiResponse {
  text: string;           // prose paragraph from GlossAI
  reasoning: string;      // short "why this match" line shown inside card
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

// Deterministic AI "match" definitions — each chip maps to one curated answer.
const RESPONSES: Record<AiChip["id"], AiResponse> = {
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
  const response = RESPONSES[chipId];
  const salon = SALONS.find((s) => s.id === response.matchedSalonId)!;
  return { response, salon };
}
