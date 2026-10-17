import type { Booking } from "./logistics";

const d = (offset: number) => {
  const t = new Date();
  t.setDate(t.getDate() + offset);
  return t.toISOString().slice(0, 10);
};

export const DEMO_BOOKINGS: Booking[] = [
  { id: "KS-24811", farmerId: "F-1021", farmerName: "Ramesh Kumar", village: "Itawa", destination: "Kota Mandi", pickupDate: d(3), windowStart: 6, windowEnd: 10, flexible: true, status: "allocated", createdAt: d(-2),
    crops: [{ crop: "Wheat", bags: 8, kgPerBag: 50 }, { crop: "Mustard", bags: 4, kgPerBag: 40 }] },
  { id: "KS-24812", farmerId: "F-1044", farmerName: "Sunita Meena", village: "Digod", destination: "Kota Mandi", pickupDate: d(3), windowStart: 7, windowEnd: 11, flexible: true, status: "allocated", createdAt: d(-1),
    crops: [{ crop: "Chickpea", bags: 6, kgPerBag: 50 }] },
  { id: "KS-24813", farmerId: "F-1067", farmerName: "Harpal Gurjar", village: "Sangod", destination: "Kota Mandi", pickupDate: d(3), windowStart: 6, windowEnd: 9, flexible: false, status: "allocated", createdAt: d(-1),
    crops: [{ crop: "Soybean", bags: 5, kgPerBag: 40 }] },
  { id: "KS-24820", farmerId: "F-1102", farmerName: "Kamla Bai", village: "Kaithun", destination: "Bundi Mandi", pickupDate: d(9), windowStart: 8, windowEnd: 12, flexible: true, status: "pooling", createdAt: d(0),
    crops: [{ crop: "Paddy", bags: 14, kgPerBag: 45 }] },
];

export const DEMO_TRIP = {
  id: "TR-0931",
  driver: { id: "D-77", name: "Mahesh Yadav", phone: "+91 98xxxx4410", vehicleNo: "RJ20 GA 4410" },
  vehicleId: "v-bolero",
  distanceKm: 46,
  bookingIds: ["KS-24811", "KS-24812", "KS-24813"],
  stops: [
    { label: "Itawa", x: 80, y: 250 },
    { label: "Digod", x: 250, y: 150 },
    { label: "Sangod", x: 420, y: 230 },
    { label: "Kota Mandi", x: 600, y: 90 },
  ] as const,
};
