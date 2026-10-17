import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/site-chrome";
import {
  BOOKING_WINDOW_DAYS, CROPS, DESTINATIONS, pickVehicle, totalBags, totalWeight, tripCost, validatePickupDate,
  type Booking, type CropLine,
} from "@/lib/logistics";
import { addBooking } from "@/lib/store";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book transport — KhetSetu" },
      { name: "description", content: "Schedule a pooled crop pickup up to 30 days ahead and declare every crop and bag." },
      { property: "og:title", content: "Book pooled crop transport — KhetSetu" },
      { property: "og:description", content: "Pickup, crops, schedule, pooled option and review in five simple steps." },
    ],
  }),
  component: BookPage,
});

const STEPS = ["Pickup & delivery", "Crops & bags", "Schedule", "Pooled option", "Review"];
const WINDOWS: [number, number][] = [[6, 9], [7, 11], [9, 12], [12, 15], [14, 17]];
const iso = (offset: number) => { const t = new Date(); t.setDate(t.getDate() + offset); return t.toISOString().slice(0, 10); };

const field = "mt-1 w-full rounded-md border bg-card px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring";

function BookPage() {
  const [step, setStep] = useState(0);
  const [village, setVillage] = useState("");
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [crops, setCrops] = useState<CropLine[]>([{ crop: "Wheat", bags: 10, kgPerBag: 50 }]);
  const [date, setDate] = useState(iso(5));
  const [win, setWin] = useState(1);
  const [flexible, setFlexible] = useState(true);
  const [done, setDone] = useState<Booking | null>(null);

  const weight = totalWeight(crops);
  const bags = totalBags(crops);
  const dateCheck = validatePickupDate(date);
  const vehicle = pickVehicle(weight, crops.length);

  const options = useMemo(() => {
    if (!vehicle) return [];
    const share = Math.min(1, weight / vehicle.payloadKg);
    return [
      { id: "pool", label: "Join pooled route", farmers: 3, km: 46, cost: Math.round(tripCost(vehicle, 46) * Math.max(share, 0.2)), status: "Pooling — vehicle not yet confirmed" },
      { id: "solo", label: "Dedicated vehicle", farmers: 1, km: 38, cost: tripCost(vehicle, 38), status: "Subject to vehicle availability" },
    ];
  }, [vehicle, weight]);
  const [opt, setOpt] = useState("pool");

  const canNext = [
    village.trim().length > 1,
    crops.length > 0 && crops.every((c) => c.bags > 0 && c.kgPerBag > 0) && !!vehicle,
    dateCheck.ok,
    options.length > 0,
    true,
  ][step];

  const confirm = () => {
    const [ws, we] = WINDOWS[win]!;
    const b: Booking = {
      id: "KS-" + Math.floor(25000 + Math.random() * 9000), farmerId: "F-1021", farmerName: "Ramesh Kumar",
      village, destination, pickupDate: date, windowStart: ws, windowEnd: we, flexible, crops,
      status: opt === "pool" ? "pooling" : "requested", createdAt: new Date().toISOString(),
    };
    addBooking(b);
    setDone(b);
    toast.success(`Booking ${b.id} created`);
  };

  if (done) {
    return (
      <>
        <PageHead eyebrow="Booking received" title={`Booking ${done.id}`}>Your digital bag manifest is ready. We will confirm the vehicle and final pickup time once capacity is allocated.</PageHead>
        <div className="mx-auto max-w-3xl px-5 py-12">
          <Manifest b={done} />
          <div className="mt-8 flex gap-3">
            <Link to="/dashboard" className="rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground">Go to my bookings</Link>
            <button onClick={() => { setDone(null); setStep(0); }} className="rounded-md border px-5 py-3 font-semibold">New booking</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead eyebrow="New booking · नई बुकिंग" title="Schedule your crop pickup">Book up to {BOOKING_WINDOW_DAYS} days before harvest. You only pay for your share of the vehicle.</PageHead>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[220px_1fr]">
        <ol className="flex gap-2 overflow-x-auto lg:flex-col">
          {STEPS.map((s, i) => (
            <li key={s} className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm ${i === step ? "bg-forest text-ivory" : i < step ? "text-forest" : "text-muted-foreground"}`}>
              <span className="font-display text-lg">{i + 1}</span>{s}
            </li>
          ))}
        </ol>

        <div className="panel p-6 md:p-8">
          {step === 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block"><span className="font-medium">Pickup village / farm</span>
                <input className={field} value={village} onChange={(e) => setVillage(e.target.value)} placeholder="e.g. Itawa, near Shiv mandir" /></label>
              <label className="block"><span className="font-medium">Deliver to</span>
                <select className={field} value={destination} onChange={(e) => setDestination(e.target.value)}>
                  {DESTINATIONS.map((d) => <option key={d}>{d}</option>)}
                </select></label>
              <p className="text-sm text-muted-foreground md:col-span-2">Map pin selection runs in demo mode — enter a village name and nearest landmark.</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {crops.map((c, i) => (
                <div key={i} className="grid grid-cols-2 gap-3 rounded-md border bg-paper/50 p-4 md:grid-cols-[1.4fr_1fr_1fr_auto]">
                  <label className="col-span-2 md:col-span-1"><span className="text-sm">Crop</span>
                    <select className={field} value={c.crop} onChange={(e) => setCrops(crops.map((x, j) => j === i ? { ...x, crop: e.target.value } : x))}>
                      {CROPS.map((k) => <option key={k}>{k}</option>)}</select></label>
                  <label><span className="text-sm">Bags</span>
                    <input type="number" min={1} className={field} value={c.bags} onChange={(e) => setCrops(crops.map((x, j) => j === i ? { ...x, bags: Math.max(0, +e.target.value) } : x))} /></label>
                  <label><span className="text-sm">Kg per bag</span>
                    <input type="number" min={1} className={field} value={c.kgPerBag} onChange={(e) => setCrops(crops.map((x, j) => j === i ? { ...x, kgPerBag: Math.max(0, +e.target.value) } : x))} /></label>
                  <button aria-label="Remove crop" disabled={crops.length === 1} onClick={() => setCrops(crops.filter((_, j) => j !== i))} className="self-end p-3 text-terracotta disabled:opacity-30"><Trash2 size={20} /></button>
                </div>
              ))}
              <button onClick={() => setCrops([...crops, { crop: "Mustard", bags: 5, kgPerBag: 40 }])} className="flex items-center gap-2 font-semibold text-forest"><Plus size={18} /> Add another crop</button>
              <div className="flex flex-wrap gap-6 border-t pt-4">
                <Stat k="Total bags" v={bags} /><Stat k="Est. weight" v={`${weight} kg`} />
                <Stat k="Vehicle fit" v={vehicle ? vehicle.label : "Too heavy for one vehicle"} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <label className="block max-w-xs"><span className="font-medium">Pickup date</span>
                <input type="date" className={field} value={date} min={iso(0)} max={iso(BOOKING_WINDOW_DAYS)} onChange={(e) => setDate(e.target.value)} /></label>
              {!dateCheck.ok && <p className="text-terracotta">{dateCheck.reason}</p>}
              <div>
                <p className="font-medium">Pickup time window</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {WINDOWS.map(([a, b], i) => (
                    <button key={i} onClick={() => setWin(i)} className={`rounded-md border px-4 py-3 ${win === i ? "border-forest bg-forest text-ivory" : "bg-card"}`}>{a}:00 – {b}:00</button>
                  ))}
                </div>
                {win === 4 && <p className="mt-2 text-sm text-terracotta">Few vehicles run afternoon routes to {destination}. This window may not be serviceable.</p>}
              </div>
              <label className="flex items-center gap-3"><input type="checkbox" className="size-5 accent-forest" checked={flexible} onChange={(e) => setFlexible(e.target.checked)} /> My pickup is flexible by ±1 day</label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {options.map((o) => (
                <button key={o.id} onClick={() => setOpt(o.id)} className={`w-full rounded-md border p-5 text-left ${opt === o.id ? "border-forest ring-2 ring-forest" : "bg-card"}`}>
                  <div className="flex justify-between"><p className="font-display text-xl text-forest">{o.label}</p><p className="font-display text-2xl">₹{o.cost}<span className="text-sm text-muted-foreground"> est.</span></p></div>
                  <p className="mt-1 text-sm text-muted-foreground">{vehicle?.label} · {o.farmers} farmer{o.farmers > 1 ? "s" : ""} · {o.km} km · window {WINDOWS[win]![0]}:00–{WINDOWS[win]![1]}:00</p>
                  <p className="mt-2 inline-block rounded bg-harvest/30 px-2 py-0.5 text-xs">{o.status}</p>
                </button>
              ))}
              <p className="text-sm text-muted-foreground">Estimates only. The final fare depends on the pooled load and route, and is shown after the trip.</p>
            </div>
          )}

          {step === 4 && (
            <Manifest b={{ id: "Draft", farmerId: "F-1021", farmerName: "Ramesh Kumar", village, destination, pickupDate: date, windowStart: WINDOWS[win]![0], windowEnd: WINDOWS[win]![1], flexible, crops, status: "requested", createdAt: "" }} />
          )}

          <div className="mt-8 flex justify-between border-t pt-6">
            <button disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-md px-5 py-3 font-semibold disabled:opacity-30">Back</button>
            {step < 4
              ? <button disabled={!canNext} onClick={() => setStep(step + 1)} className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-40">Continue</button>
              : <button onClick={confirm} className="rounded-md bg-harvest px-6 py-3 font-semibold text-charcoal">Confirm booking</button>}
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ k, v }: { k: string; v: React.ReactNode }) {
  return <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{k}</p><p className="font-display text-xl text-forest">{v}</p></div>;
}

export function Manifest({ b }: { b: Booking }) {
  return (
    <div className="rounded-md border bg-card">
      <div className="flex flex-wrap justify-between gap-2 border-b bg-paper px-5 py-3">
        <p className="font-display text-lg">Bag manifest · {b.id}</p>
        <p className="text-sm text-muted-foreground">{b.village} → {b.destination} · {b.pickupDate} · {b.windowStart}:00–{b.windowEnd}:00</p>
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground"><tr><th className="px-5 py-2">Crop</th><th>Bags</th><th>Kg/bag</th><th className="pr-5 text-right">Weight</th></tr></thead>
        <tbody>
          {b.crops.map((c, i) => <tr key={i} className="border-t"><td className="px-5 py-2">{c.crop}</td><td>{c.bags}</td><td>{c.kgPerBag}</td><td className="pr-5 text-right">{c.bags * c.kgPerBag} kg</td></tr>)}
          <tr className="border-t font-semibold"><td className="px-5 py-2">Total</td><td>{totalBags(b.crops)}</td><td /><td className="pr-5 text-right">{totalWeight(b.crops)} kg</td></tr>
        </tbody>
      </table>
    </div>
  );
}
