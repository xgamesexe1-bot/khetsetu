// Core business rules for the pooled transport prototype.
// Pure functions only — UI and (future) server code both call these.

export type CropLine = { crop: string; bags: number; kgPerBag: number; notes?: string };

export type Booking = {
  id: string;
  farmerId: string;
  farmerName: string;
  village: string;
  destination: string;
  pickupDate: string; // YYYY-MM-DD
  windowStart: number; // hour of day
  windowEnd: number;
  flexible: boolean;
  crops: CropLine[];
  status: "requested" | "pooling" | "allocated" | "picked_up" | "delivered" | "cancelled";
  createdAt: string;
};

export type Vehicle = {
  id: string;
  type: "chhota_hathi" | "bolero_pickup";
  label: string;
  payloadKg: number;
  zones: number;
  ratePerKm: number;
  baseFare: number;
};

export const VEHICLES: Vehicle[] = [
  { id: "v-ace", type: "chhota_hathi", label: "Tata Ace (Chhota Hathi)", payloadKg: 750, zones: 4, ratePerKm: 18, baseFare: 400 },
  { id: "v-bolero", type: "bolero_pickup", label: "Mahindra Bolero Pickup", payloadKg: 1500, zones: 6, ratePerKm: 24, baseFare: 600 },
];

export const BOOKING_WINDOW_DAYS = 30;

function dayDiff(dateISO: string, today: Date): number {
  const d = new Date(dateISO + "T00:00:00");
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

/** Pickup must be today or later, and no more than 30 days ahead. */
export function validatePickupDate(dateISO: string, today = new Date()): { ok: boolean; reason?: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return { ok: false, reason: "Choose a date" };
  const diff = dayDiff(dateISO, today);
  if (diff < 0) return { ok: false, reason: "Date is in the past" };
  if (diff > BOOKING_WINDOW_DAYS) return { ok: false, reason: `Bookings open up to ${BOOKING_WINDOW_DAYS} days ahead` };
  return { ok: true };
}

export function totalBags(crops: CropLine[]) {
  return crops.reduce((s, c) => s + (c.bags || 0), 0);
}
export function totalWeight(crops: CropLine[]) {
  return crops.reduce((s, c) => s + (c.bags || 0) * (c.kgPerBag || 0), 0);
}

export function windowsOverlap(a: Pick<Booking, "windowStart" | "windowEnd">, b: Pick<Booking, "windowStart" | "windowEnd">) {
  return Math.max(a.windowStart, b.windowStart) < Math.min(a.windowEnd, b.windowEnd);
}

/** A set of bookings can share a vehicle when destination, date and a common time window agree and weight fits. */
export function poolFeasibility(bookings: Booking[], vehicle: Vehicle): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (bookings.length === 0) return { ok: false, reasons: ["No bookings"] };
  const [first] = bookings;
  if (bookings.some((b) => b.destination !== first.destination)) reasons.push("Different destinations");
  if (bookings.some((b) => b.pickupDate !== first.pickupDate)) reasons.push("Different pickup dates");
  const start = Math.max(...bookings.map((b) => b.windowStart));
  const end = Math.min(...bookings.map((b) => b.windowEnd));
  if (start >= end) reasons.push("No common pickup window");
  const weight = bookings.reduce((s, b) => s + totalWeight(b.crops), 0);
  if (weight > vehicle.payloadKg) reasons.push(`Load ${weight} kg exceeds ${vehicle.payloadKg} kg payload`);
  const lines = bookings.reduce((s, b) => s + b.crops.length, 0);
  if (lines > vehicle.zones) reasons.push(`Needs ${lines} cargo zones, vehicle has ${vehicle.zones}`);
  return { ok: reasons.length === 0, reasons };
}

export type ZoneAllocation = {
  zone: string;
  bookingId: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  bags: number;
  weightKg: number;
  stop: number;
};

/** One zone per farmer-crop line, loaded in reverse pickup order is not required here: zones follow pickup sequence. */
export function allocateZones(bookings: Booking[], vehicle: Vehicle): ZoneAllocation[] {
  const check = poolFeasibility(bookings, vehicle);
  if (!check.ok) throw new Error(check.reasons.join("; "));
  const out: ZoneAllocation[] = [];
  bookings.forEach((b, stopIdx) => {
    b.crops.forEach((c) => {
      out.push({
        zone: String.fromCharCode(65 + out.length),
        bookingId: b.id,
        farmerId: b.farmerId,
        farmerName: b.farmerName,
        crop: c.crop,
        bags: c.bags,
        weightKg: c.bags * c.kgPerBag,
        stop: stopIdx + 1,
      });
    });
  });
  return out;
}

export type Reconciliation = {
  scheduled: number;
  collected: number;
  difference: number;
  status: "verified" | "discrepancy";
};

/** Never mutates the scheduled count; any mismatch is a discrepancy. */
export function reconcileBags(scheduled: number, collected: number): Reconciliation {
  const difference = scheduled - collected;
  return { scheduled, collected, difference, status: difference === 0 ? "verified" : "discrepancy" };
}

/** A pickup can close only if verified, or a discrepancy carries a note and a resolution. */
export function canClosePickup(r: Reconciliation, opts: { photoTaken: boolean; note?: string; resolved?: boolean }) {
  if (!opts.photoTaken) return false;
  if (r.status === "verified") return true;
  return Boolean(opts.note && opts.note.trim().length > 0 && opts.resolved);
}

export type AllocationMethod = "weight" | "bags" | "equal";

/** Splits a trip cost across farmers; rounds to rupees and puts the remainder on the largest share. */
export function allocateCost(totalCost: number, shares: { id: string; weightKg: number; bags: number }[], method: AllocationMethod) {
  const basis = shares.map((s) => (method === "weight" ? s.weightKg : method === "bags" ? s.bags : 1));
  const sum = basis.reduce((a, b) => a + b, 0) || 1;
  const raw = shares.map((s, i) => ({ id: s.id, amount: Math.floor((totalCost * basis[i]) / sum) }));
  const remainder = totalCost - raw.reduce((a, r) => a + r.amount, 0);
  if (raw.length) {
    const maxIdx = basis.indexOf(Math.max(...basis));
    raw[maxIdx].amount += remainder;
  }
  return raw;
}

export function tripCost(vehicle: Vehicle, distanceKm: number) {
  return Math.round(vehicle.baseFare + vehicle.ratePerKm * distanceKm);
}

/** Pick the smallest vehicle that can carry the load. */
export function pickVehicle(weightKg: number, zones: number): Vehicle | null {
  return VEHICLES.find((v) => v.payloadKg >= weightKg && v.zones >= zones) ?? null;
}

export const CROPS = ["Wheat", "Mustard", "Chickpea", "Paddy", "Soybean", "Maize", "Onion", "Potato"];
export const DESTINATIONS = ["Kota Mandi", "Bundi Mandi", "Baran APMC", "Jhalawar Mandi"];
