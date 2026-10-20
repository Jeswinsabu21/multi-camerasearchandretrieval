import { createFileRoute } from "@tanstack/react-router";
import { SavedEvidence } from "../components/SavedEvidence";

export const Route = createFileRoute("/results")({
  validateSearch: (search: Record<string, unknown>) => ({ case: typeof search.case === "string" ? search.case : "" }),
  head: () => ({ meta: [{ title: "Case Details — TRINETRA" }, { name: "description", content: "Saved evidence, movement route, and investigator review for each case." }, { property: "og:title", content: "Case Details — TRINETRA" }, { property: "og:description", content: "Review uploaded evidence and the movement route across camera locations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Results,
});

function Results() {
  const { case: initialCase } = Route.useSearch();
  return <SavedEvidence initialCase={initialCase} title="Case Details" />;
}
