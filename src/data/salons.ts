export type PriceTier = "₹₹" | "₹₹₹" | "₹₹₹₹";

export interface Service {
  name: string;
  price: number;
  durationMin: number;
}

export interface Salon {
  id: string;
  name: string;
  locality: string;
  rating: number;
  reviewCount: number;
  primaryCategory: string;
  priceRange: PriceTier;
  image: string;
  tagline: string;
  services: Service[];
}

export const CATEGORIES = [
  "All",
  "Haircut",
  "Bridal Makeup",
  "Skincare",
  "Nail Art",
  "Luxury Spa",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Map our capsule categories to the terms used in primaryCategory / service names.
export const CATEGORY_MATCH: Record<
  Exclude<Category, "All">,
  string[]
> = {
  Haircut: ["Haircut", "Hair Spa", "Hair"],
  "Bridal Makeup": ["Bridal Makeup", "Makeup"],
  Skincare: ["Skincare", "Facial", "Skin"],
  "Nail Art": ["Nail Art", "Nails", "Manicure", "Pedicure"],
  "Luxury Spa": ["Luxury Spa", "Spa", "Massage", "Therapy"],
};

export const SALONS: Salon[] = [
  {
    id: "lakme-bandra",
    name: "Lakmé Absolute Salon",
    locality: "Bandra West",
    rating: 4.9,
    reviewCount: 2143,
    primaryCategory: "Bridal Makeup",
    priceRange: "₹₹₹₹",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    tagline: "Flagship couture beauty atelier",
    services: [
      { name: "Signature Haircut & Style", price: 1800, durationMin: 60 },
      { name: "Bridal Makeup Trial", price: 6500, durationMin: 90 },
      { name: "Skin Brightening Facial", price: 3200, durationMin: 75 },
      { name: "Luxury Hair Spa Ritual", price: 2200, durationMin: 60 },
      { name: "Gel Nail Extension", price: 2800, durationMin: 90 },
    ],
  },
  {
    id: "naturals-juhu",
    name: "Naturals Lounge",
    locality: "Juhu",
    rating: 4.7,
    reviewCount: 1876,
    primaryCategory: "Haircut",
    priceRange: "₹₹₹",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
    tagline: "Modern hair artistry by the sea",
    services: [
      { name: "Precision Haircut", price: 1200, durationMin: 45 },
      { name: "Keratin Smooth Therapy", price: 7500, durationMin: 180 },
      { name: "Balayage Colour", price: 6500, durationMin: 150 },
      { name: "Hair Spa & Scalp Detox", price: 1500, durationMin: 60 },
      { name: "Express Facial Glow", price: 1800, durationMin: 45 },
    ],
  },
  {
    id: "enrich-colaba",
    name: "Enrich Salon & Spa",
    locality: "Colaba",
    rating: 4.8,
    reviewCount: 1632,
    primaryCategory: "Luxury Spa",
    priceRange: "₹₹₹₹",
    image:
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1200&q=80",
    tagline: "Heritage spa with modern refinement",
    services: [
      { name: "Aromatherapy Deep Tissue Spa", price: 4500, durationMin: 90 },
      { name: "Hot Stone Back Therapy", price: 3200, durationMin: 60 },
      { name: "Anti-Ageing Gold Facial", price: 4800, durationMin: 90 },
      { name: "Design Haircut", price: 1400, durationMin: 50 },
      { name: "French Manicure", price: 1200, durationMin: 45 },
    ],
  },
  {
    id: "bodycraft-andheri",
    name: "Bodycraft Spa & Salon",
    locality: "Andheri West",
    rating: 4.8,
    reviewCount: 2401,
    primaryCategory: "Skincare",
    priceRange: "₹₹₹₹",
    image:
      "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=1200&q=80",
    tagline: "Clinically-crafted skincare sanctuary",
    services: [
      { name: "HydraGlow Medical Facial", price: 5200, durationMin: 75 },
      { name: "Laser Skin Rejuvenation", price: 8500, durationMin: 60 },
      { name: "Luxury Pedicure Ritual", price: 2400, durationMin: 60 },
      { name: "Bridal Airbrush Makeup", price: 12000, durationMin: 120 },
      { name: "Scalp Renewal Spa", price: 2800, durationMin: 70 },
    ],
  },
  {
    id: "yss-malad",
    name: "YSS The Signature Salon",
    locality: "Malad",
    rating: 4.6,
    reviewCount: 987,
    primaryCategory: "Bridal Makeup",
    priceRange: "₹₹₹",
    image:
      "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80",
    tagline: "Celebrity bridal transformations",
    services: [
      { name: "Complete Bridal Look", price: 18500, durationMin: 240 },
      { name: "HD Party Makeup", price: 4500, durationMin: 90 },
      { name: "Pre-Bridal Glow Facial", price: 3800, durationMin: 80 },
      { name: "Hair Styling & Curls", price: 1600, durationMin: 50 },
      { name: "Nail Art Extensions", price: 2500, durationMin: 75 },
    ],
  },
  {
    id: "lakme-thane",
    name: "Lakmé Absolute — Thane",
    locality: "Thane",
    rating: 4.7,
    reviewCount: 1342,
    primaryCategory: "Skincare",
    priceRange: "₹₹₹",
    image:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80",
    tagline: "Premium skincare in the suburbs",
    services: [
      { name: "D-Tan Radiance Facial", price: 2200, durationMin: 60 },
      { name: "Signature Haircut", price: 1100, durationMin: 45 },
      { name: "Threading & Shaping", price: 350, durationMin: 20 },
      { name: "Gel Polish Manicure", price: 1400, durationMin: 50 },
      { name: "Hair Protein Treatment", price: 2800, durationMin: 75 },
    ],
  },
  {
    id: "blue-dot-lower-parel",
    name: "BluEDot Hairbar",
    locality: "Lower Parel",
    rating: 4.9,
    reviewCount: 1567,
    primaryCategory: "Haircut",
    priceRange: "₹₹₹₹",
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
    tagline: "Editorial hair, in the mill district",
    services: [
      { name: "Architect Haircut", price: 2400, durationMin: 60 },
      { name: "Global Hair Colour", price: 5500, durationMin: 150 },
      { name: "Keratin Treatment", price: 9500, durationMin: 200 },
      { name: "Korean Glass Facial", price: 4200, durationMin: 80 },
      { name: "Spa Pedicure", price: 1800, durationMin: 55 },
    ],
  },
  {
    id: "jeansebastian-worli",
    name: "Jean-Claude Biguine",
    locality: "Worli",
    rating: 4.6,
    reviewCount: 1123,
    primaryCategory: "Haircut",
    priceRange: "₹₹₹",
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
    tagline: "Parisian craft, Mumbai address",
    services: [
      { name: "Parisian Signature Cut", price: 1600, durationMin: 55 },
      { name: "Balayage Highlights", price: 7200, durationMin: 180 },
      { name: "Botanical Hair Spa", price: 1900, durationMin: 60 },
      { name: "Express Bridal Makeup", price: 5500, durationMin: 90 },
      { name: "Luxury Manicure", price: 1300, durationMin: 45 },
    ],
  },
  {
    id: "toni-goregaon",
    name: "Toni & Guy Luxury",
    locality: "Goregaon",
    rating: 4.5,
    reviewCount: 876,
    primaryCategory: "Haircut",
    priceRange: "₹₹₹₹",
    image:
      "https://images.unsplash.com/photo-1580618672591-eb180b1a563a?auto=format&fit=crop&w=1200&q=80",
    tagline: "British luxury hairdressing house",
    services: [
      { name: "Label M Haircut", price: 2100, durationMin: 60 },
      { name: "Creative Colour", price: 6800, durationMin: 165 },
      { name: "Repair Hair Spa", price: 2400, durationMin: 70 },
      { name: "Gloss Facial", price: 3000, durationMin: 65 },
      { name: "Acrylic Nail Extensions", price: 3000, durationMin: 90 },
    ],
  },
  {
    id: "thefacialbar-bandra",
    name: "The Facial Bar",
    locality: "Bandra East",
    rating: 4.8,
    reviewCount: 654,
    primaryCategory: "Skincare",
    priceRange: "₹₹₹",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03baf0fb2?auto=format&fit=crop&w=1200&q=80",
    tagline: "Express facials, clinical results",
    services: [
      { name: "Vitamin C Brightening Facial", price: 3500, durationMin: 60 },
      { name: "Express 30-Min Facial", price: 1800, durationMin: 30 },
      { name: "HydraFacial Deep Cleanse", price: 4200, durationMin: 70 },
      { name: "Dermaplaning Glow", price: 2800, durationMin: 50 },
      { name: "Korean Glass Routine", price: 3800, durationMin: 65 },
    ],
  },
  {
    id: "spacifique-churchgate",
    name: "Spacifique Wellness",
    locality: "Churchgate",
    rating: 4.9,
    reviewCount: 432,
    primaryCategory: "Luxury Spa",
    priceRange: "₹₹₹₹",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    tagline: "Bespoke wellness, southern tip",
    services: [
      { name: "Balinese Full Body Spa", price: 6800, durationMin: 120 },
      { name: "Swedish Aromatherapy", price: 5500, durationMin: 90 },
      { name: "Couple Spa Retreat", price: 12000, durationMin: 120 },
      { name: "Foot Reflexology", price: 2800, durationMin: 50 },
      { name: "De-Stress Head Therapy", price: 2200, durationMin: 40 },
    ],
  },
  {
    id: "haus-of-nails-juhu",
    name: "Haus of Nails",
    locality: "Juhu",
    rating: 4.7,
    reviewCount: 589,
    primaryCategory: "Nail Art",
    priceRange: "₹₹₹",
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
    tagline: "Artistry at your fingertips",
    services: [
      { name: "Chrome Gel Nail Art", price: 2800, durationMin: 90 },
      { name: "Custom Hand-Painted Nails", price: 3500, durationMin: 120 },
      { name: "Luxury Spa Pedicure", price: 2200, durationMin: 60 },
      { name: "BIAB Strengthening Overlay", price: 2400, durationMin: 75 },
      { name: "Festival Nail Extensions", price: 3200, durationMin: 100 },
    ],
  },
];
