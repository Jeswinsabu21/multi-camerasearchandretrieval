import type { ReviewStatus } from "../data/mockData";

const CASE_KEY = "trinetra-cases";
const REVIEW_KEY = "trinetra-reviews";

export function saveCase(caseData: unknown) {
  const current = JSON.parse(localStorage.getItem(CASE_KEY) ?? "[]") as unknown[];
  localStorage.setItem(CASE_KEY, JSON.stringify([caseData, ...current]));
}

export function getSavedCases<T>() {
  if (typeof window === "undefined") return [] as T[];
  return JSON.parse(localStorage.getItem(CASE_KEY) ?? "[]") as T[];
}

export function saveReview(trackId: string, status: ReviewStatus) {
  const current = JSON.parse(localStorage.getItem(REVIEW_KEY) ?? "{}") as Record<string, ReviewStatus>;
  localStorage.setItem(REVIEW_KEY, JSON.stringify({ ...current, [trackId]: status }));
}

export function getReviews() {
  if (typeof window === "undefined") return {} as Record<string, ReviewStatus>;
  return JSON.parse(localStorage.getItem(REVIEW_KEY) ?? "{}") as Record<string, ReviewStatus>;
}
