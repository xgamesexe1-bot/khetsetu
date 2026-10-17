import { createFileRoute } from "@tanstack/react-router";
import { HomeStory } from "@/components/home-story";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KhetSetu — Many harvests, one journey to the mandi" },
      { name: "description", content: "Pool your crop transport with nearby farmers. Book up to 30 days ahead, every bag verified by photo." },
      { property: "og:title", content: "KhetSetu — Pooled crop transport" },
      { property: "og:description", content: "Share a mini truck with nearby farmers. Every bag counted, photographed and kept in your own zone." },
    ],
  }),
  component: HomeStory,
});
