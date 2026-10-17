import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Check, AlertTriangle, CloudOff, Phone } from "lucide-react";
import { toast } from "sonner";
import { DEMO_TRIP } from "@/lib/demo-data";
import { allocateZones, canClosePickup, reconcileBags, totalBags, VEHICLES } from "@/lib/logistics";
import { useBookings } from "@/lib/store";

export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [
      { title: "Driver pickup & bag verification — KhetSetu" },
      { name: "description", content: "Mobile pickup flow: photograph bags, confirm count, assign cargo zone, resolve discrepancies." },
      { property: "og:title", content: "Driver app — KhetSetu" },
      { property: "og:description", content: "Photograph, count and verify every farmer's bags at pickup." },
    ],
  }),
  component: DriverPage,
});

type StopRecord = { photo?: string; collected?: number; note?: string; resolved?: boolean; done?: boolean; synced?: boolean };

function DriverPage() {
  const bookings = useBookings().filter((b) => DEMO_TRIP.bookingIds.includes(b.id));
  const zones = allocateZones(bookings, VEHICLES.find((v) => v.id === DEMO_TRIP.vehicleId)!);
  const [active, setActive] = useState(0);
  const [recs, setRecs] = useState<Record<string, StopRecord>>({});
  const [online, setOnline] = useState(true);
  const b = bookings[active];
  if (!b) return <p className="p-10">No trip assigned.</p>;
  const rec = recs[b.id] ?? {};
  const set = (p: Partial<StopRecord>) => setRecs({ ...recs, [b.id]: { ...rec, ...p } });
  const scheduled = totalBags(b.crops);
  const r = rec.collected !== undefined ? reconcileBags(scheduled, rec.collected) : null;
  const myZones = zones.filter((z) => z.bookingId === b.id);

  const complete = () => {
    if (!r || !canClosePickup(r, { photoTaken: !!rec.photo, note: rec.note, resolved: rec.resolved })) return;
    set({ done: true, synced: online });
    toast.success(online ? "Pickup saved and uploaded" : "Saved on phone — will upload when online");
    if (active < bookings.length - 1) setActive(active + 1);
  };

  const big = "flex w-full items-center justify-center gap-2 rounded-md py-4 text-lg font-semibold disabled:opacity-40";

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="flex items-center justify-between">
        <div><p className="eyebrow text-earth">Trip {DEMO_TRIP.id}</p><p className="font-display text-2xl text-forest">{DEMO_TRIP.driver.vehicleNo}</p></div>
        <button onClick={() => setOnline(!online)} className={`flex items-center gap-1 rounded px-3 py-2 text-sm ${online ? "bg-leaf/25 text-forest" : "bg-terracotta text-destructive-foreground"}`}>
          {online ? "Online" : <><CloudOff size={16} /> Offline</>}
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        {bookings.map((x, i) => (
          <button key={x.id} onClick={() => setActive(i)} className={`flex-1 rounded-md border py-2 text-sm ${i === active ? "border-forest bg-forest text-ivory" : recs[x.id]?.done ? "bg-leaf/20" : "bg-card"}`}>
            {recs[x.id]?.done ? "✓ " : ""}Stop {i + 1}
          </button>
        ))}
      </div>

      <div className="panel mt-4 p-5">
        <div className="flex justify-between">
          <div><p className="font-display text-2xl">{b.farmerName}</p><p className="text-sm text-muted-foreground">{b.id} · {b.village} · {b.windowStart}:00–{b.windowEnd}:00</p></div>
          <a href="tel:+910000000000" aria-label="Call farmer" className="self-start rounded-full bg-paper p-3"><Phone size={20} /></a>
        </div>
        <ul className="mt-4 space-y-2">
          {myZones.map((z) => (
            <li key={z.zone} className="flex items-center gap-3 rounded-md bg-paper p-3">
              <span className="flex size-10 items-center justify-center rounded bg-harvest font-display text-xl">{z.zone}</span>
              <span className="flex-1">{z.crop}</span><b>{z.bags} bags</b>
            </li>
          ))}
        </ul>

        {rec.done ? (
          <p className="mt-5 flex items-center gap-2 rounded-md bg-leaf/20 p-4 font-semibold text-forest"><Check /> Pickup complete {rec.synced ? "· uploaded" : "· pending upload"}</p>
        ) : (
          <div className="mt-5 space-y-3">
            <label className={`${big} cursor-pointer ${rec.photo ? "border border-forest bg-card text-forest" : "bg-forest text-ivory"}`}>
              <Camera /> {rec.photo ? "Retake photo" : "Take photo of bags"}
              <input type="file" accept="image/*" capture="environment" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) set({ photo: URL.createObjectURL(f) }); }} />
            </label>
            {rec.photo && (
              <div className="relative">
                <img src={rec.photo} alt="Pickup bags" className="h-40 w-full rounded-md object-cover" />
                <span className="absolute left-2 top-2 rounded bg-charcoal/80 px-2 py-0.5 text-xs text-ivory">{online ? "Will upload on submit" : "Pending upload"}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md bg-border text-center">
              <div className="bg-card p-3"><p className="text-xs text-muted-foreground">Scheduled</p><p className="font-display text-3xl">{scheduled}</p></div>
              <label className="bg-card p-3"><p className="text-xs text-muted-foreground">Collected</p>
                <input type="number" inputMode="numeric" aria-label="Collected bags" value={rec.collected ?? ""} onChange={(e) => set({ collected: e.target.value === "" ? undefined : Math.max(0, +e.target.value), resolved: false })}
                  className="w-full bg-transparent text-center font-display text-3xl focus:outline-none" placeholder="–" /></label>
              <div className={`p-3 ${r?.status === "discrepancy" ? "bg-terracotta/20" : "bg-card"}`}><p className="text-xs text-muted-foreground">Difference</p><p className="font-display text-3xl">{r ? r.difference : "–"}</p></div>
            </div>
            {r?.status === "verified" && <p className="flex items-center gap-2 font-semibold text-forest"><Check size={18} /> Count verified</p>}
            {r?.status === "discrepancy" && (
              <div className="space-y-2 rounded-md border border-terracotta p-3">
                <p className="flex items-center gap-2 font-semibold text-terracotta"><AlertTriangle size={18} /> Pickup discrepancy — recount, then explain</p>
                <textarea className="w-full rounded border bg-card p-2" rows={2} placeholder="Reason (e.g. 3 bags not ready, farmer agreed)" value={rec.note ?? ""} onChange={(e) => set({ note: e.target.value })} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-5 accent-forest" checked={!!rec.resolved} onChange={(e) => set({ resolved: e.target.checked })} /> Farmer confirmed collected count (OTP demo)</label>
                <p className="text-xs text-muted-foreground">Declared count stays {scheduled}. Operator is notified.</p>
              </div>
            )}
            <button onClick={complete} disabled={!r || !canClosePickup(r, { photoTaken: !!rec.photo, note: rec.note, resolved: rec.resolved })} className={`${big} bg-harvest text-charcoal`}>
              Complete pickup
            </button>
          </div>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Demo driver: {DEMO_TRIP.driver.name}. Photos stay on this device in the prototype.</p>
    </div>
  );
}
