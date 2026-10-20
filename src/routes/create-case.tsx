import { createFileRoute } from "@tanstack/react-router";
import { CaseWorkspace } from "../components/CaseWorkspace";

export const Route = createFileRoute("/create-case")({
  head: () => ({ meta: [{ title: "Create Case — TRINETRA" }, { name: "description", content: "Create an investigation case with reference details and camera footage." }, { property: "og:title", content: "Create Investigation Case — TRINETRA" }, { property: "og:description", content: "Prepare a human-reviewed multi-camera evidence search case." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: CaseWorkspace,
});
