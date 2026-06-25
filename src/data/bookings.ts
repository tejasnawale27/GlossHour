const STORAGE_KEY = "gloss_bookings";

export interface BookingRecord {
  id: string;            // e.g. GLOSS-8X2A
  salonId: string;
  salonName: string;
  salonLocality: string;
  salonImage: string;
  services: { name: string; price: number; durationMin: number }[];
  date: string;          // ISO "YYYY-MM-DD"
  dateLabel: string;     // e.g. "Wed, 25 Jun"
  time: string;          // e.g. "10:30 AM"
  totalPrice: number;
  totalDuration: number;
  guestName: string;
  guestPhone: string;
  createdAt: string;     // ISO timestamp
}

export function loadBookings(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookingRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveBooking(booking: BookingRecord): void {
  try {
    const existing = loadBookings();
    const updated = [booking, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — fail silently
  }
}

export function removeBooking(id: string): void {
  try {
    const updated = loadBookings().filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
