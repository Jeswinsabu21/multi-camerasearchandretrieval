# TRINETRA Frontend Prototype

## Goal
Build a simple, clean, responsive investigator dashboard that demonstrates the documented multi-camera CCTV search methodology using realistic mock data only.

## What will be built
- Shared sidebar layout with Dashboard, Create Case, Process Case, Search & Results, Evidence, Case History, and System Status.
- Dashboard summary with restrained statistics, recent cases, pending reviews, and processing status.
- Create Investigation Case form with query modes, person/vehicle attributes, and repeatable camera-footage entries.
- Simulated case-processing screen covering detection, tracking, attributes, captions, embeddings, evidence indexing, matching, route-time validation, and explainable ranking.
- Investigation Results with five ranked candidates, filtering summary, clear score evidence, and route/time plausibility.
- Evidence detail panel with side-by-side reference/matched views, candidate timeline, ranking explanation, and Confirm/Reject/Further Review actions.
- Searchable Case History and an Evidence Index table.
- Session persistence in browser storage for created cases and investigator decisions.

## Design
- Academic admin-console style: white and soft neutral surfaces, deep navy navigation, restrained blue accents, compact typography, clear tables, and minimal motion.
- Responsive sidebar and readable single-column mobile layouts.
- Simple locally rendered CCTV-style evidence placeholders so the prototype remains self-contained.
- Persistent notice that AI rankings are decision-support evidence and final decisions remain with the authorised investigator.

## Technical approach
- Keep TanStack Start routing and create a small route for each primary screen.
- Use reusable React components and centralized mock services/data; no backend, authentication, or real ML models.
- Use URL-safe navigation and simple React state; important logic receives concise beginner-friendly comments.
- Add route-specific metadata and verify key interactions in desktop and mobile views.

## Quality checks
- Confirm the app loads without errors and navigation reaches every page.
- Test adding cameras, saving a case, simulated processing, opening evidence, changing review status, and searching case history.
- Check that prohibited autonomous-identification language never appears.
