import { useSyncExternalStore } from "react";
import type { Booking } from "./logistics";
import { DEMO_BOOKINGS } from "./demo-data";

// Demo-only local persistence. Replace with Lovable Cloud tables for production.
const KEY = "khetsetu.bookings.v1";
let cache: Booking[] | null = null;
const listeners = new Set<() => void>();

function read(): Booking[] {
  if (cache) return cache;
  if (typeof window === "undefined") return DEMO_BOOKINGS;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Booking[]) : DEMO_BOOKINGS;
  } catch {
    cache = DEMO_BOOKINGS;
  }
  return cache;
}

export function addBooking(b: Booking) {
  cache = [b, ...read()];
  localStorage.setItem(KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}

export function updateBooking(id: string, patch: Partial<Booking>) {
  cache = read().map((b) => (b.id === id ? { ...b, ...patch } : b));
  localStorage.setItem(KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}

export function useBookings(): Booking[] {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    read,
    () => DEMO_BOOKINGS,
  );
}
