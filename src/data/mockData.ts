export type ReviewStatus = "Pending Review" | "Confirmed by Investigator" | "Rejected by Investigator" | "Further Review";

export type Candidate = {
  rank: number; trackId: string; similarity: number; attributeScore: number;
  camera: string; location: string; timestamp: string; plausible: boolean;
  status: ReviewStatus; attributes: string[]; caption: string;
};

export const candidates: Candidate[] = [
  { rank: 1, trackId: "P-1042", similarity: 94, attributeScore: 96, camera: "CAM-02", location: "Library Junction", timestamp: "10:35:48", plausible: true, status: "Pending Review", attributes: ["Green short-sleeved shirt", "Black shorts", "Black sneakers"], caption: "Adult male walking outdoors, wearing a green short-sleeved shirt, black shorts and black sneakers." },
  { rank: 2, trackId: "P-1088", similarity: 89, attributeScore: 91, camera: "CAM-03", location: "Parking Area", timestamp: "10:39:12", plausible: true, status: "Pending Review", attributes: ["Green upper clothing", "Dark shorts", "Black footwear"], caption: "Adult male in green upper clothing and dark shorts near the parking area." },
  { rank: 3, trackId: "P-1132", similarity: 84, attributeScore: 87, camera: "CAM-04", location: "South Block", timestamp: "10:40:08", plausible: false, status: "Pending Review", attributes: ["Green shirt", "Black trousers", "White footwear"], caption: "Adult wearing a green shirt and black trousers." },
  { rank: 4, trackId: "P-1190", similarity: 81, attributeScore: 79, camera: "CAM-01", location: "Main Gate", timestamp: "10:31:42", plausible: true, status: "Pending Review", attributes: ["Olive shirt", "Black shorts", "Dark footwear"], caption: "Adult male near the main gate in an olive shirt and dark shorts." },
  { rank: 5, trackId: "P-1231", similarity: 77, attributeScore: 75, camera: "CAM-05", location: "Canteen Road", timestamp: "10:43:55", plausible: true, status: "Pending Review", attributes: ["Green jacket", "Dark lower clothing", "Black shoes"], caption: "Adult in green outerwear moving along the canteen road." },
];

export const cases = [
  { id: "CASE-2026-001", title: "Campus Movement Investigation", date: "05 Oct 2026", investigator: "Jeswin Sabu", subject: "Person", cameras: 3, candidates: 5, confirmed: 2, status: "Completed", updated: "Today, 12:42" },
  { id: "CASE-2026-002", title: "Parking Area Vehicle Search", date: "04 Oct 2026", investigator: "Johan Jomy", subject: "Vehicle", cameras: 4, candidates: 8, confirmed: 1, status: "Pending Review", updated: "Yesterday, 17:10" },
  { id: "CASE-2026-003", title: "Library Corridor Review", date: "02 Oct 2026", investigator: "Sejith R. Nath", subject: "Person", cameras: 2, candidates: 3, confirmed: 0, status: "Processing", updated: "02 Oct, 15:26" },
];

export const evidenceRows = [
  { id: "P-1042", type: "Person", camera: "CAM-02", time: "10:35:48", location: "Library Junction", attributes: "Green shirt, black shorts", embedding: "768-d · Ready" },
  { id: "P-1088", type: "Person", camera: "CAM-03", time: "10:39:12", location: "Parking Area", attributes: "Green top, dark shorts", embedding: "768-d · Ready" },
  { id: "V-2041", type: "Vehicle", camera: "CAM-01", time: "10:38:21", location: "Main Gate", attributes: "White sedan", embedding: "768-d · Ready" },
  { id: "P-1132", type: "Person", camera: "CAM-04", time: "10:40:08", location: "South Block", attributes: "Green shirt, trousers", embedding: "768-d · Ready" },
];

export const processingSteps = [
  ["Data Collection", "3 camera videos loaded"],
  ["Detection & Tracking", "RT-DETR + ByteTrack · 928 tracklets"],
  ["Attribute Extraction", "Qwen2.5-VL · structured attributes"],
  ["Caption Generation", "Natural-language descriptions"],
  ["Embedding Generation", "928 embeddings · 768 dimensions"],
  ["Evidence Storage", "Metadata and evidence indexed"],
  ["Query Matching", "Attribute pre-filter + similarity search"],
  ["Spatiotemporal Validation", "Route travel-time checks"],
  ["Explainable Ranking", "Candidate evidence prepared for review"],
] as const;
