import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/site-chrome";
import { VEHICLES } from "@/lib/logistics";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing and fare sharing — KhetSetu" },
      { name: "description", content: "Transparent vehicle rates and how a pooled trip's cost is split between farmers." },
      { property: "og:title", content: "Pricing — KhetSetu" },
      { property: "og:description", content: "Vehicle rates and transparent fare sharing for pooled crop trips." },
    ],
  }),
  component: () => (
    <>
      <PageHead eyebrow="Pricing · मूल्य" title="You pay your share of the trip — nothing hidden">Rates below are demo values for the prototype.</PageHead>
      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {VEHICLES.map((v) => (
            <div key={v.id} className="panel p-6">
              <h2 className="text-2xl text-forest">{v.label}</h2>
              <p className="mt-1 text-muted-foreground">Up to {v.payloadKg} kg · {v.zones} cargo zones</p>
              <p className="mt-4 font-display text-4xl">₹{v.baseFare} <span className="text-base text-muted-foreground">base</span> + ₹{v.ratePerKm}<span className="text-base text-muted-foreground">/km</span></p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[["By weight", "Default. Your share = your kg ÷ total kg on the trip."], ["By bag count", "Used when bags are similar in size."], ["Equal split", "Used for small, similar loads when everyone agrees."]].map(([t, d]) => (
            <div key={t} className="border-t-2 border-harvest pt-4"><h3 className="text-xl text-forest">{t}</h3><p className="mt-2 text-muted-foreground">{d}</p></div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">Waiting time, extra unloading and taxes are shown as separate lines. We don’t show savings figures unless a real comparison fare is available.</p>
      </div>
    </>
  ),
});
