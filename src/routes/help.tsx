import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/site-chrome";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = [
  ["How far ahead can I book?", "Up to 30 days before your pickup date."],
  ["Will my crop mix with others?", "No. Each farmer and crop gets a marked cargo zone, shown on your manifest."],
  ["What if fewer bags are collected?", "The driver records the actual count with a photo. You confirm it, and the original booking count is never changed."],
  ["When is my vehicle confirmed?", "Only after enough capacity and a route are allocated. Until then your booking shows “Finding farmers to share”."],
  ["Can I cancel?", "Yes, from your dashboard. Cancelling before allocation is free in this prototype."],
  ["Does it work in Hindi?", "Menus show Hindi labels today; full Hindi screens are on the roadmap."],
];

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help and FAQs — KhetSetu" },
      { name: "description", content: "Answers about booking, bag counts, cargo zones, cancellation and support." },
      { property: "og:title", content: "Help & FAQs — KhetSetu" },
      { property: "og:description", content: "Common questions from farmers and drivers." },
    ],
  }),
  component: () => (
    <>
      <PageHead eyebrow="Help · सहायता" title="Questions farmers ask us" />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Accordion type="single" collapsible>
          {FAQ.map(([q, a]) => (
            <AccordionItem key={q} value={q}><AccordionTrigger className="text-left text-lg">{q}</AccordionTrigger><AccordionContent className="text-base text-muted-foreground">{a}</AccordionContent></AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  ),
});
