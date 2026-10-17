import type { ZoneAllocation } from "@/lib/logistics";
import { DEMO_TRIP } from "@/lib/demo-data";

const ZONE_FILL = ["fill-harvest/70", "fill-leaf/60", "fill-terracotta/60", "fill-earth/50", "fill-forest/40", "fill-harvest/40"];

/** Top-down truck with labelled cargo zones. */
export function TruckLayout({ zones, highlight }: { zones: ZoneAllocation[]; highlight?: string }) {
  const n = Math.max(zones.length, 1);
  const cols = Math.ceil(n / 2);
  const w = 360 / cols;
  return (
    <svg viewBox="0 0 520 220" className="w-full" role="img" aria-label="Truck loading plan">
      <rect x="400" y="40" width="100" height="140" rx="18" className="fill-forest" />
      <rect x="430" y="55" width="55" height="110" rx="8" className="fill-ivory/20" />
      <rect x="20" y="20" width="380" height="180" rx="6" className="fill-paper stroke-earth" strokeWidth="2" />
      {zones.map((z, i) => {
        const col = Math.floor(i / 2);
        const row = i % 2;
        const x = 30 + col * w;
        const y = 30 + row * 82;
        const dim = highlight && highlight !== z.bookingId;
        return (
          <g key={z.zone} opacity={dim ? 0.35 : 1}>
            <rect x={x} y={y} width={w - 8} height={76} rx="4" className={`${ZONE_FILL[i % 6]} stroke-charcoal/30`} strokeDasharray="4 3" />
            <text x={x + 8} y={y + 22} className="fill-charcoal font-display" fontSize="18" fontWeight="700">{z.zone}</text>
            <text x={x + 8} y={y + 42} className="fill-charcoal" fontSize="11">{z.farmerName.split(" ")[0]} · {z.crop}</text>
            <text x={x + 8} y={y + 60} className="fill-charcoal/70" fontSize="11">{z.bags} bags · {z.weightKg} kg</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Schematic route map (mock map adapter — no external tiles). */
export function RouteMap({ progress = 1 }: { progress?: number }) {
  const s = DEMO_TRIP.stops;
  const d = `M ${s[0].x} ${s[0].y} C 150 260, 180 140, ${s[1].x} ${s[1].y} S 380 260, ${s[2].x} ${s[2].y} S 560 120, ${s[3].x} ${s[3].y}`;
  return (
    <svg viewBox="0 0 680 320" className="w-full rounded-lg border bg-paper" role="img" aria-label="Pooled route map">
      <defs>
        <pattern id="fields" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 40 L40 0" className="stroke-leaf/15" strokeWidth="6" />
        </pattern>
      </defs>
      <rect width="680" height="320" fill="url(#fields)" />
      <path d="M0 300 Q 300 260 680 290" className="stroke-earth/30" strokeWidth="14" fill="none" />
      <path d={d} className="stroke-earth/30" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d={d} className="stroke-forest" strokeWidth="4" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - progress} />
      {s.map((p, i) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r={i === s.length - 1 ? 14 : 11} className={i === s.length - 1 ? "fill-terracotta" : "fill-harvest stroke-forest"} strokeWidth="2" />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" className="fill-charcoal">{i === s.length - 1 ? "M" : i + 1}</text>
          <text x={p.x} y={p.y - 20} textAnchor="middle" fontSize="13" className="fill-charcoal font-display">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}
