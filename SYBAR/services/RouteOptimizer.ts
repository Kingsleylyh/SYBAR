import { GoogleGenerativeAI } from "@google/generative-ai";
import { LocationData, LatLng } from "@/types/routes";
import Constants from "expo-constants";

// Retrieve the key from the config
const GEMINI_KEY = Constants.expoConfig?.extra?.geminiApiKey;
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  generationConfig: {
    responseMimeType: "application/json", // Forces Gemini to return pure JSON
  },
});
/* Models
gemini-3-flash
gemini-3-flash-preview
gemini-3.1-pro-preview
gemini-2.0-flash
*/
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Strips ```json ... ``` markdown wrappers Gemini sometimes adds
const cleanJsonResponse = (text: string): string => {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
};

// ── Return types ─────────────────────────────────────────────────────────────

// DRIVE / TWO_WHEELER: single API call with all stops
export interface OptimizedDriveRoute {
  origin: LatLng;
  destination: LatLng;
  stops: LatLng[];
}

// TRANSIT: one segment per leg since Routes API doesn't support multi-stop transit
export interface OptimizedTransitSegment {
  origin: LatLng;
  destination: LatLng;
}

export type OptimizedRouteResult =
  | { mode: "DRIVE" | "TWO_WHEELER"; route: OptimizedDriveRoute }
  | { mode: "TRANSIT"; segments: OptimizedTransitSegment[] };

// ── Prompt builders ───────────────────────────────────────────────────────────

const buildLocationText = (locations: LocationData[]): string =>
  locations
    .map(
      (l, i) => `  Destination ${i + 1}:
    Name: ${l.name}
    Address: ${l.formattedAddress}
    Latitude: ${l.coordinates.latitude}
    Longitude: ${l.coordinates.longitude}`,
    )
    .join("\n");

// Gemini decides the best visit order and which ends up as origin/stops/destination
const DRIVE_OUTPUT_FORMAT = `
Return a single JSON object in this exact format (no markdown, no extra text):
{
  "origin": { "latitude": 0.0, "longitude": 0.0 },
  "destination": { "latitude": 0.0, "longitude": 0.0 },
  "stops": [
    { "latitude": 0.0, "longitude": 0.0 },
    { "latitude": 0.0, "longitude": 0.0 }
  ]
}
Rules for this format:
- "origin" is always the fixed Starting Point provided above.
- "stops" is the list of optimized intermediate locations in visit order. If there is only 1 destination total, "stops" must be an empty array [].
- "destination" is the LAST location in the optimized visit order (chosen by you from the destinations list).
- All locations from the destinations list must appear exactly once, either in "stops" or as "destination".
`;

// Gemini chains all legs sequentially; the last destination in its optimized order ends the chain
const TRANSIT_OUTPUT_FORMAT = `
Return a JSON array of sequential transit legs in optimized visit order.
The route must be fully chained: Starting Point → Location A → Location B → ... → Final Location.
Each leg's destination is the next leg's origin.

Format (no markdown, no extra text):
[
  { "origin": { "latitude": 0.0, "longitude": 0.0 }, "destination": { "latitude": 0.0, "longitude": 0.0 } },
  { "origin": { "latitude": 0.0, "longitude": 0.0 }, "destination": { "latitude": 0.0, "longitude": 0.0 } }
]

Rules for this format:
- The first leg's origin must always be the fixed Starting Point.
- The order of destinations is fully determined by you to minimize total travel time.
- Every location from the destinations list must appear exactly once as a leg destination.
- The number of legs must equal the number of destinations provided.
`;

// ── Main export ───────────────────────────────────────────────────────────────
export const getOptimizedRoute = async (
  start: LocationData,
  destinations: LocationData[],
  mode: "DRIVE" | "TWO_WHEELER" | "TRANSIT",
): Promise<OptimizedRouteResult> => {
  if (destinations.length === 0) {
    throw new Error("At least one destination is required.");
  }

  const outputFormat =
    mode === "TRANSIT" ? TRANSIT_OUTPUT_FORMAT : DRIVE_OUTPUT_FORMAT;

  const prompt = `
You are a route optimization assistant. Your job is to determine the most efficient visit order for all destinations below, given the travel mode: ${mode}.

Key Rules:
- The Starting Point is FIXED. It is always the first origin. Do not move it or reorder it.
- All destinations listed below are in RANDOM order. You must reorder them to minimize total travel distance or time.
- You freely decide which destination is visited first, second, ..., and which becomes the final destination.
- No destination may be skipped. Every destination must appear exactly once in your output.
- Use the exact latitude and longitude values provided. Do not alter or approximate coordinates.
- Output must be valid JSON only. No markdown, no extra explanation.

Starting Point (FIXED — always the first origin):
  Name: ${start.name}
  Address: ${start.formattedAddress}
  Latitude: ${start.coordinates.latitude}
  Longitude: ${start.coordinates.longitude}

Destinations (${destinations.length} total — reorder these freely to optimize the route):
${buildLocationText(destinations)}

${outputFormat}
  `.trim();

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const cleaned = cleanJsonResponse(rawText); // Clean the string if it contains markdown blocks

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("Gemini response could not be parsed as JSON:", rawText);
    throw new Error(
      "Route optimization failed: invalid JSON response from Gemini.",
    );
  }

  // ── Validate and shape the typed result ─────────────────────────────────────────
  if (mode === "TRANSIT") {
    if (!Array.isArray(parsed)) {
      throw new Error("TRANSIT response must be a JSON array of legs.");
    }
    if (parsed.length !== destinations.length) {
      console.warn(
        `Expected ${destinations.length} transit legs, got ${parsed.length}.`,
      );
    }
    const segments: OptimizedTransitSegment[] = parsed.map(
      (seg: any, i: number) => {
        if (!seg.origin || !seg.destination) {
          throw new Error(
            `Transit leg ${i + 1} is missing origin or destination.`,
          );
        }
        return {
          origin: {
            latitude: seg.origin.latitude,
            longitude: seg.origin.longitude,
          },
          destination: {
            latitude: seg.destination.latitude,
            longitude: seg.destination.longitude,
          },
        };
      },
    );
    return { mode: "TRANSIT", segments };
  } else {
    if (!parsed.origin || !parsed.destination) {
      throw new Error("Drive route response is missing origin or destination.");
    }
    const route: OptimizedDriveRoute = {
      origin: {
        latitude: parsed.origin.latitude,
        longitude: parsed.origin.longitude,
      },
      destination: {
        latitude: parsed.destination.latitude,
        longitude: parsed.destination.longitude,
      },
      // If only 1 destination was provided, stops will correctly be []
      stops:
        parsed.stops?.map((s: any) => ({
          latitude: s.latitude,
          longitude: s.longitude,
        })) ?? [],
    };
    return { mode, route };
  }
};
