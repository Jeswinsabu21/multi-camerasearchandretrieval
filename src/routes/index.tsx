import { createFileRoute } from "@tanstack/react-router";
import { CreateCase } from "./create-case";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Multi Camera Search Project — TRINETRA" }, { name: "description", content: "Prepare a multi-camera investigation case for human-reviewed evidence search." }, { property: "og:title", content: "Multi Camera Search Project — TRINETRA" }, { property: "og:description", content: "Create a case and prepare reference details and camera footage." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: CreateCase,
});
