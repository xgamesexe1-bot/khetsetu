import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHead } from "@/components/site-chrome";
import { RouteMap } from "@/components/cargo";
import { totalBags, totalWeight } from "@/lib/logistics";
import { updateBooking, useBookings } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My bookings — KhetSetu farmer dashboard" },
      { name: "description", content: "See your upcoming pickups, pooling status, bag manifests and live trip tracking." },
      { property: "og:title", content: "Farmer dashboard — KhetSetu" },
      { property: "og:description", content: "Upcoming pickups, pooling status and trip tracking for farmers." },
    ],
  }),
  component: Dashboard,
});

const STATUS: Record<string, string> = {
  requested: "Requested", pooling: "Finding farmers to share", allocated: "Vehicle allocated",
  picked_up: "Picked up", delivered: "Delivered", cancelled: "Cancelled",
};

function Dashboard() {
  const all = useBookings();
  const mine = all.filter((b) => b.farmerId === "F-1021");
  const active = mine.find((b) => b.status === "allocated");
  return (
    <>
      <PageHead eyebrow="Namaste, Ramesh ji" title="Your harvest pickups">Demo account · Farmer ID F-1021 · Itawa, Kota</PageHead>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-2xl text-forest">Bookings</h2>
            <Link to="/book" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">New booking</Link></div>
          {mine.map((b) => (
            <div key={b.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="font-display text-xl">{b.id} · {b.destination}</p>
                  <p className="text-sm text-muted-foreground">{b.pickupDate} · {b.windowStart}:00–{b.windowEnd}:00 · from {b.village}</p></div>
                <span className={`rounded px-2 py-1 text-xs font-semibold ${b.status === "allocated" ? "bg-leaf/30 text-forest" : b.status === "cancelled" ? "bg-muted" : "bg-harvest/30"}`}>{STATUS[b.status]}</span>
              </div>
              <p className="mt-3 text-sm">{b.crops.map((c) => `${c.crop} ${c.bags}`).join(" · ")} — <b>{totalBags(b.crops)} bags, {totalWeight(b.crops)} kg</b></p>
              {b.status !== "cancelled" && b.status !== "delivered" && (
                <button onClick={() => { updateBooking(b.id, { status: "cancelled" }); toast("Booking cancelled. Pooled routes will be recalculated."); }}
                  className="mt-3 text-sm text-terracotta underline">Cancel booking</button>
              )}
            </div>
          ))}
        </div>
        <aside className="space-y-4">
          <h2 className="text-2xl text-forest">Live trip</h2>
          {active ? (
            <div className="panel p-4">
              <RouteMap progress={0.35} />
              <p className="mt-3 text-sm"><b>{active.id}</b> — Bolero RJ20 GA 4410, driver Mahesh. You are stop 1 of 3. Zones A & B reserved for you.</p>
              <p className="mt-1 text-xs text-muted-foreground">Tracking shown from demo data.</p>
            </div>
          ) : <p className="text-muted-foreground">No vehicle allocated yet.</p>}
        </aside>
      </div>
    </>
  );
}
