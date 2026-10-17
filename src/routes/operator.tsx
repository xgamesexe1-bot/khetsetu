import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead } from "@/components/site-chrome";
import { RouteMap, TruckLayout } from "@/components/cargo";
import { DEMO_TRIP } from "@/lib/demo-data";
import { allocateCost, allocateZones, poolFeasibility, totalWeight, tripCost, VEHICLES, type AllocationMethod } from "@/lib/logistics";
import { useBookings } from "@/lib/store";

export const Route = createFileRoute("/operator")({
  head: () => ({
    meta: [
      { title: "Operations — pools, cargo plans and trips · KhetSetu" },
      { name: "description", content: "Operator view of pooled bookings, feasibility checks, cargo zones and cost allocation." },
      { property: "og:title", content: "Operations dashboard — KhetSetu" },
      { property: "og:description", content: "Pool bookings, check capacity, plan cargo zones and split fares." },
    ],
  }),
  component: Operator,
});

function Operator() {
  const all = useBookings();
  const trip = all.filter((b) => DEMO_TRIP.bookingIds.includes(b.id) && b.status !== "cancelled");
  const [vId, setVId] = useState(DEMO_TRIP.vehicleId);
  const [method, setMethod] = useState<AllocationMethod>("weight");
  const [hl, setHl] = useState<string>();
  const vehicle = VEHICLES.find((v) => v.id === vId)!;
  const feas = poolFeasibility(trip, vehicle);
  const zones = feas.ok ? allocateZones(trip, vehicle) : [];
  const load = trip.reduce((s, b) => s + totalWeight(b.crops), 0);
  const cost = tripCost(vehicle, DEMO_TRIP.distanceKm);
  const split = allocateCost(cost, trip.map((b) => ({ id: b.id, weightKg: totalWeight(b.crops), bags: b.crops.reduce((s, c) => s + c.bags, 0) })), method);
  const queue = all.filter((b) => b.status === "pooling" || b.status === "requested");

  return (
    <>
      <PageHead eyebrow="Operations" title={`Trip ${DEMO_TRIP.id} · Kota Mandi`}>Route optimisation uses a demo VRP-TW adapter. Swap the vehicle to see capacity checks react.</PageHead>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-2">
        <section className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl text-forest">Cargo plan</h2>
            <select value={vId} onChange={(e) => setVId(e.target.value)} className="rounded-md border bg-card px-3 py-2">
              {VEHICLES.map((v) => <option key={v.id} value={v.id}>{v.label} · {v.payloadKg} kg · {v.zones} zones</option>)}
            </select>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded bg-muted"><div className={`h-full ${load > vehicle.payloadKg ? "bg-terracotta" : "bg-leaf"}`} style={{ width: `${Math.min(100, (load / vehicle.payloadKg) * 100)}%` }} /></div>
          <p className="mt-1 text-sm text-muted-foreground">{load} / {vehicle.payloadKg} kg</p>
          {feas.ok ? <div className="mt-4"><TruckLayout zones={zones} highlight={hl} /></div>
            : <ul className="mt-4 space-y-1 rounded-md bg-terracotta/15 p-4 text-sm text-terracotta">{feas.reasons.map((r) => <li key={r}>✕ {r}</li>)}</ul>}
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-muted-foreground"><tr><th>Zone</th><th>Farmer</th><th>Crop</th><th>Bags</th><th>Stop</th></tr></thead>
            <tbody>{zones.map((z) => (
              <tr key={z.zone} className="cursor-pointer border-t hover:bg-paper" onMouseEnter={() => setHl(z.bookingId)} onMouseLeave={() => setHl(undefined)}>
                <td className="py-2 font-display text-lg">{z.zone}</td><td>{z.farmerName}</td><td>{z.crop}</td><td>{z.bags}</td><td>{z.stop}</td></tr>))}</tbody>
          </table>
        </section>

        <section className="space-y-6">
          <div className="panel p-5"><h2 className="text-2xl text-forest">Route</h2><div className="mt-3"><RouteMap /></div></div>
          <div className="panel p-5">
            <div className="flex items-center justify-between"><h2 className="text-2xl text-forest">Fare split</h2>
              <select value={method} onChange={(e) => setMethod(e.target.value as AllocationMethod)} className="rounded-md border bg-card px-3 py-2 text-sm">
                <option value="weight">By weight</option><option value="bags">By bag count</option><option value="equal">Equal split</option>
              </select></div>
            <p className="mt-1 text-sm text-muted-foreground">Trip cost ₹{cost} = base ₹{vehicle.baseFare} + {DEMO_TRIP.distanceKm} km × ₹{vehicle.ratePerKm}</p>
            <ul className="mt-3 divide-y">{split.map((s) => { const b = trip.find((x) => x.id === s.id)!; return <li key={s.id} className="flex justify-between py-2"><span>{b.farmerName}</span><b>₹{s.amount}</b></li>; })}</ul>
          </div>
          <div className="panel p-5">
            <h2 className="text-2xl text-forest">Waiting to pool</h2>
            <ul className="mt-3 divide-y text-sm">{queue.map((b) => <li key={b.id} className="flex justify-between py-2"><span>{b.id} · {b.farmerName} → {b.destination}</span><span className="text-muted-foreground">{b.pickupDate}</span></li>)}
              {queue.length === 0 && <li className="py-2 text-muted-foreground">Queue empty</li>}</ul>
            <p className="mt-3 text-xs text-muted-foreground">ONDC Logistics adapter: mock mode — no live network calls.</p>
          </div>
        </section>
      </div>
    </>
  );
}
