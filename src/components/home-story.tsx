import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import heroField from "@/assets/hero-field.jpg";
import verifyBags from "@/assets/verify-bags.jpg";
import farmerMustard from "@/assets/farmer-mustard.jpg";
import { RouteMap, TruckLayout } from "./cargo";
import { allocateZones, VEHICLES } from "@/lib/logistics";
import { DEMO_BOOKINGS } from "@/lib/demo-data";

const SEEDS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100, delay: (i % 7) * 0.9, dur: 9 + (i % 5) * 2, size: 3 + (i % 3) * 2,
}));

function Seeds() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {SEEDS.map((s, i) => (
        <motion.span key={i} className="absolute top-0 rounded-full bg-harvest"
          style={{ left: `${s.left}%`, width: s.size, height: s.size * 1.8 }}
          initial={{ y: -20, x: 0, opacity: 0, rotate: 0 }}
          animate={{ y: "105vh", x: [0, 30, -10, 40], opacity: [0, 0.9, 0.9, 0], rotate: 220 }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "linear" }} />
      ))}
    </div>
  );
}

const ROAD = "M -20 520 C 200 470, 320 380, 520 400 S 860 330, 1020 250";
const FARMS = [{ x: 170, y: 478, c: "Wheat · 12" }, { x: 470, y: 402, c: "Chickpea · 6" }, { x: 760, y: 330, c: "Soybean · 5" }];

function HeroStage({ p }: { p: MotionValue<number> }) {
  const scale = useTransform(p, [0, 0.6], [1.25, 1]);
  const imgOpacity = useTransform(p, [0.55, 0.85], [1, 0.12]);
  const titleY = useTransform(p, [0, 0.25], [0, -80]);
  const titleO = useTransform(p, [0, 0.22], [1, 0]);
  const overlayO = useTransform(p, [0.18, 0.32], [0, 1]);
  const roadLen = useTransform(p, [0.25, 0.8], [0, 1]);
  const mapO = useTransform(p, [0.75, 0.92], [0, 1]);
  const truckOffset = useTransform(roadLen, (v) => `${v * 100}%`);
  return (
    <div className="sticky top-0 h-screen overflow-hidden bg-charcoal">
      <motion.img src={heroField} alt="Harvested wheat field at sunset with grain sacks and a mini truck on a rural road"
        width={1920} height={1088} style={{ scale, opacity: imgOpacity }} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-transparent to-charcoal/70" />
      <Seeds />
      <motion.div style={{ y: titleY, opacity: titleO }} className="absolute inset-x-0 bottom-[14vh] mx-auto max-w-7xl px-5 text-ivory">
        <p className="eyebrow text-harvest">Pooled crop transport · Hadoti, Rajasthan</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] md:text-7xl">Many harvests.<br />One journey to the mandi.</h1>
        <p className="mt-5 max-w-xl text-lg text-ivory/85">Share a Chhota Hathi with farmers on your road. Every bag counted, photographed and kept in your own zone.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/book" className="rounded-md bg-harvest px-6 py-3 font-semibold text-charcoal">Schedule a pickup</Link>
          <Link to="/how-it-works" className="rounded-md border border-ivory/50 px-6 py-3 font-semibold text-ivory">See how it works</Link>
        </div>
        <p className="mt-10 text-xs uppercase tracking-[0.2em] text-ivory/60">Scroll to follow the harvest ↓</p>
      </motion.div>

      <motion.div style={{ opacity: overlayO }} className="absolute inset-0 flex items-center justify-center px-4">
        <svg viewBox="0 0 1000 600" className="h-auto w-full max-w-6xl">
          <motion.path d={ROAD} className="stroke-ivory/30" strokeWidth="18" fill="none" strokeLinecap="round" />
          <motion.path d={ROAD} className="stroke-harvest" strokeWidth="5" fill="none" strokeDasharray="1 0" style={{ pathLength: roadLen }} />
          {FARMS.map((f, i) => (
            <FarmPin key={i} p={roadLen} at={(i + 0.5) / 3.4} {...f} />
          ))}
          <motion.g style={{ offsetPath: `path("${ROAD}")`, offsetDistance: truckOffset, offsetRotate: "auto" } as never}>
            <rect x="-26" y="-14" width="34" height="28" rx="3" className="fill-paper stroke-charcoal" />
            <rect x="8" y="-11" width="18" height="22" rx="4" className="fill-forest" />
          </motion.g>
          <motion.text style={{ opacity: mapO }} x="1000" y="230" textAnchor="end" className="fill-ivory font-display" fontSize="30">Kota Mandi</motion.text>
        </svg>
        <motion.div style={{ opacity: mapO }} className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-md bg-ivory/95 px-5 py-3 text-center text-sm text-charcoal shadow">
          3 farmers · 23 bags · 1 shared Bolero · 46 km
        </motion.div>
      </motion.div>
    </div>
  );
}

function FarmPin({ p, at, x, y, c }: { p: MotionValue<number>; at: number; x: number; y: number; c: string }) {
  const o = useTransform(p, [at - 0.1, at], [0, 1]);
  const s = useTransform(p, [at - 0.1, at], [0.4, 1]);
  return (
    <motion.g style={{ opacity: o, scale: s, transformOrigin: `${x}px ${y}px` }}>
      {[0, 1, 2].map((k) => (
        <ellipse key={k} cx={x - 14 + k * 14} cy={y - 26} rx="9" ry="12" className="fill-paper stroke-earth" strokeWidth="2" />
      ))}
      <circle cx={x} cy={y} r="8" className="fill-harvest stroke-charcoal" />
      <text x={x} y={y - 48} textAnchor="middle" className="fill-ivory" fontSize="18" fontWeight="600">{c}</text>
    </motion.g>
  );
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Chapter({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <p className="eyebrow text-terracotta">Chapter {n}</p>
      <h2 className="mt-3 text-4xl font-semibold text-forest md:text-5xl">{title}</h2>
      <div className="mt-5 max-w-md text-lg text-muted-foreground">{children}</div>
    </Reveal>
  );
}

const PLOTS = [
  { name: "Ramesh, Itawa", crop: "Wheat", bags: 8 }, { name: "Ramesh, Itawa", crop: "Mustard", bags: 4 },
  { name: "Sunita, Digod", crop: "Chickpea", bags: 6 }, { name: "Harpal, Sangod", crop: "Soybean", bags: 5 },
];

function RouteChapter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const prog = useTransform(scrollYProgress, [0.15, 0.6], [0, 1]);
  return (
    <section ref={ref} className="grain bg-paper py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-[1fr_1.4fr]">
        <Chapter n="02" title="One shared journey">Bookings heading to the same mandi with overlapping pickup windows are combined into one route — ordered so nobody waits past their window.</Chapter>
        <MotionRoute p={prog} />
      </div>
    </section>
  );
}
function MotionRoute({ p }: { p: MotionValue<number> }) {
  const [v, setV] = useState(0);
  useMotionValueEvent(p, "change", setV);
  return <RouteMap progress={v} />;
}

function CargoChapter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const zones = allocateZones(DEMO_BOOKINGS.slice(0, 3), VEHICLES[1]!);
  const clip = useTransform(scrollYProgress, [0.2, 1], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  return (
    <section ref={ref} className="py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-[1.4fr_1fr]">
        <motion.div style={{ clipPath: clip }} className="panel p-4"><TruckLayout zones={zones} /></motion.div>
        <Chapter n="03" title="Every bag has its place">The cargo bed is split into marked zones — one per farmer and crop. Weight is checked against the vehicle’s payload before a trip is confirmed.</Chapter>
      </div>
    </section>
  );
}

export function HomeStory() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end end"] });
  return (
    <>
      <div ref={heroRef} className="relative h-[320vh]"><HeroStage p={scrollYProgress} /></div>

      <section className="py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[1fr_1.3fr]">
          <div className="md:sticky md:top-28 md:self-start">
            <Chapter n="01" title="Every farmer has a harvest">Most small farmers have 5 to 20 bags — too few to hire a whole truck, too many for a tractor trip alone.</Chapter>
            <Reveal delay={0.2} className="mt-8 overflow-hidden rounded-lg">
              <img src={farmerMustard} alt="Farmer holding a mustard harvest" loading="lazy" width={1200} height={1408} className="aspect-[4/3] w-full object-cover" />
            </Reveal>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {PLOTS.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="panel grain overflow-hidden">
                  <div className={`h-28 ${["bg-harvest/50", "bg-harvest/80", "bg-leaf/50", "bg-earth/40"][i]}`}
                    style={{ backgroundImage: "repeating-linear-gradient(100deg, transparent 0 10px, color-mix(in oklab, var(--charcoal) 8%, transparent) 10px 12px)" }} />
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground">{p.name}</p>
                    <p className="mt-1 font-display text-2xl text-forest">{p.crop}</p>
                    <p className="mt-3 font-display text-5xl text-earth">{p.bags}<span className="ml-2 font-sans text-base text-muted-foreground">bags</span></p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <RouteChapter />
      <CargoChapter />

      <section className="bg-forest py-28 text-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2">
          <Reveal className="overflow-hidden rounded-lg">
            <motion.img src={verifyBags} alt="Driver photographing crop sacks in a pickup" loading="lazy" width={1200} height={1408}
              initial={{ scale: 1.15 }} whileInView={{ scale: 1 }} transition={{ duration: 1.4 }} viewport={{ once: true }} className="aspect-[4/5] w-full object-cover" />
          </Reveal>
          <div>
            <Reveal><p className="eyebrow text-harvest">Chapter 04</p><h2 className="mt-3 text-4xl font-semibold md:text-5xl">Every bag is verified</h2>
              <p className="mt-5 max-w-md text-lg text-ivory/80">At each stop the driver photographs the bags, enters the count, and confirms the zone. A mismatch is never hidden — it stays open until it is resolved.</p></Reveal>
            <Reveal delay={0.2} className="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-md bg-ivory/20 text-center">
              {[["Scheduled", "50"], ["Collected", "47"], ["Difference", "3"]].map(([k, v]) => (
                <div key={k} className="bg-forest p-4"><p className="text-xs uppercase tracking-wider text-ivory/60">{k}</p><p className="font-display text-4xl">{v}</p></div>
              ))}
            </Reveal>
            <Reveal delay={0.3}><p className="mt-3 inline-block rounded bg-terracotta px-3 py-1 text-sm">Pickup discrepancy — action required</p></Reveal>
          </div>
        </div>
      </section>

      <section className="grain bg-paper py-28 text-center">
        <Reveal className="mx-auto max-w-3xl px-5">
          <p className="eyebrow text-terracotta">Chapter 05</p>
          <h2 className="mt-3 text-4xl font-semibold text-forest md:text-6xl">Delivered, with a record for every bag.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">Each farmer sees pickup photos, the delivered count, and exactly how the shared fare was split.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/book" className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground">Schedule a pickup</Link>
            <Link to="/pricing" className="rounded-md border border-forest px-6 py-3 font-semibold text-forest">How fares are shared</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
