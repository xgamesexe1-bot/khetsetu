import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/site-chrome";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How pooled crop transport works — KhetSetu" },
      { name: "description", content: "From booking to mandi: how farmers share vehicles, keep bags separate, and verify every pickup." },
      { property: "og:title", content: "How KhetSetu works" },
      { property: "og:description", content: "Book, pool, load by zone, verify by photo, deliver." },
    ],
  }),
  component: () => (
    <>
      <PageHead eyebrow="How it works · कैसे काम करता है" title="From your field to the mandi, in six steps" />
      <ol className="mx-auto max-w-4xl divide-y px-5 py-10">
        {[
          ["Book up to 30 days ahead", "Tell us your village, mandi, crops and number of bags. Pick a morning or afternoon window."],
          ["We find farmers on your road", "Bookings to the same mandi with overlapping windows are grouped. Nothing is promised until a vehicle is allocated."],
          ["A local vehicle is assigned", "Chhota Hathi or Bolero Pickup owners near you take the trip — the smallest vehicle that safely fits the load."],
          ["Your bags get their own zone", "The cargo bed is marked into zones. Your crop never mixes with another farmer’s."],
          ["Driver photographs and counts", "At pickup the driver photographs your bags and enters the count. Any difference is recorded, never hidden."],
          ["Delivered and fairly priced", "You see the delivered count, photos and how the shared fare was split."],
        ].map(([t, d], i) => (
          <li key={t} className="grid gap-4 py-8 md:grid-cols-[80px_1fr]">
            <span className="font-display text-6xl text-harvest">{i + 1}</span>
            <div><h2 className="text-2xl text-forest">{t}</h2><p className="mt-2 text-lg text-muted-foreground">{d}</p></div>
          </li>
        ))}
      </ol>
      <div className="pb-16 text-center"><Link to="/book" className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground">Schedule a pickup</Link></div>
    </>
  ),
});
