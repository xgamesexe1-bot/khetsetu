import { describe, expect, it } from "vitest";
import {
  allocateCost, allocateZones, canClosePickup, poolFeasibility, reconcileBags,
  totalWeight, validatePickupDate, VEHICLES, type Booking,
} from "./logistics";

const today = new Date(2026, 9, 18);
const mk = (id: string, crops: Booking["crops"], over: Partial<Booking> = {}): Booking => ({
  id, farmerId: "F" + id, farmerName: id, village: "x", destination: "Kota Mandi",
  pickupDate: "2026-10-25", windowStart: 7, windowEnd: 11, flexible: true, crops,
  status: "requested", createdAt: "", ...over,
});

describe("30-day booking window", () => {
  it("accepts exactly 30 days ahead", () => expect(validatePickupDate("2026-11-17", today).ok).toBe(true));
  it("rejects 31 days ahead", () => expect(validatePickupDate("2026-11-18", today).ok).toBe(false));
  it("rejects past dates", () => expect(validatePickupDate("2026-10-17", today).ok).toBe(false));
});

describe("weight", () => {
  it("multiplies bags by kg per bag", () =>
    expect(totalWeight([{ crop: "Wheat", bags: 25, kgPerBag: 50 }, { crop: "Mustard", bags: 10, kgPerBag: 40 }])).toBe(1650));
});

describe("pooling", () => {
  const ace = VEHICLES[0]!;
  it("rejects load above payload", () => {
    const r = poolFeasibility([mk("a", [{ crop: "Wheat", bags: 16, kgPerBag: 50 }])], ace);
    expect(r.ok).toBe(false);
  });
  it("rejects non-overlapping windows", () => {
    const r = poolFeasibility([mk("a", [{ crop: "Wheat", bags: 2, kgPerBag: 50 }]), mk("b", [{ crop: "Wheat", bags: 2, kgPerBag: 50 }], { windowStart: 11, windowEnd: 14 })], ace);
    expect(r.reasons).toContain("No common pickup window");
  });
  it("gives each farmer-crop line its own zone", () => {
    const z = allocateZones([mk("a", [{ crop: "Wheat", bags: 5, kgPerBag: 50 }, { crop: "Mustard", bags: 2, kgPerBag: 40 }]), mk("b", [{ crop: "Chickpea", bags: 3, kgPerBag: 50 }])], ace);
    expect(z.map((x) => x.zone)).toEqual(["A", "B", "C"]);
  });
});

describe("bag reconciliation", () => {
  it("50 scheduled, 47 collected is a 3-bag discrepancy", () => {
    expect(reconcileBags(50, 47)).toEqual({ scheduled: 50, collected: 47, difference: 3, status: "discrepancy" });
  });
  it("cannot close a discrepancy without note and resolution", () => {
    expect(canClosePickup(reconcileBags(50, 47), { photoTaken: true })).toBe(false);
    expect(canClosePickup(reconcileBags(50, 47), { photoTaken: true, note: "3 wet bags left", resolved: true })).toBe(true);
  });
  it("cannot close without a photo", () => expect(canClosePickup(reconcileBags(5, 5), { photoTaken: false })).toBe(false));
});

describe("cost sharing", () => {
  it("splits by weight and sums to total", () => {
    const r = allocateCost(1000, [{ id: "a", weightKg: 300, bags: 6 }, { id: "b", weightKg: 100, bags: 2 }], "weight");
    expect(r).toEqual([{ id: "a", amount: 750 }, { id: "b", amount: 250 }]);
  });
});
