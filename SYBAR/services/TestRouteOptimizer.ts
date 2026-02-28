import {
  getOptimizedRoute,
  OptimizedDriveRoute,
  OptimizedTransitSegment,
  OptimizedRouteResult,
} from "@/services/RouteOptimizer";
import { LocationData } from "@/types/routes";

// ── Test Locations (Kuala Lumpur) ─────────────────────────────────────────────

const KLCC: LocationData = {
  coordinates: { latitude: 3.1579, longitude: 101.7123 },
  name: "KLCC",
  formattedAddress: "Kuala Lumpur City Centre, 50088 Kuala Lumpur",
};

const MidValley: LocationData = {
  coordinates: { latitude: 3.1187, longitude: 101.6775 },
  name: "Mid Valley Megamall",
  formattedAddress: "Mid Valley City, Lingkaran Syed Putra, 59200 Kuala Lumpur",
};

const PavilionKL: LocationData = {
  coordinates: { latitude: 3.1478, longitude: 101.713 },
  name: "Pavilion KL",
  formattedAddress: "168, Jalan Bukit Bintang, 55100 Kuala Lumpur",
};

const SunwayPyramid: LocationData = {
  coordinates: { latitude: 3.0733, longitude: 101.6069 },
  name: "Sunway Pyramid",
  formattedAddress: "3, Jalan PJS 11/15, Bandar Sunway, 47500 Petaling Jaya",
};

const IKEACheras: LocationData = {
  coordinates: { latitude: 3.123, longitude: 101.715 },
  name: "IKEA Cheras",
  formattedAddress: "No 2, Jalan Cochrane, Seksyen 90, 55100 Kuala Lumpur",
};

const BukitBintangMRT: LocationData = {
  coordinates: { latitude: 3.1463, longitude: 101.7093 },
  name: "Bukit Bintang MRT Station",
  formattedAddress: "Jalan Bukit Bintang, 55100 Kuala Lumpur",
};

const KLSentral: LocationData = {
  coordinates: { latitude: 3.1338, longitude: 101.6864 },
  name: "KL Sentral",
  formattedAddress: "Jalan Stesen Sentral, 50470 Kuala Lumpur",
};

const MasjidJamek: LocationData = {
  coordinates: { latitude: 3.1489, longitude: 101.6956 },
  name: "Masjid Jamek LRT Station",
  formattedAddress: "Jalan Tun Perak, 50050 Kuala Lumpur",
};

// ── Logger ────────────────────────────────────────────────────────────────────

const logDriveResult = (label: string, result: OptimizedRouteResult) => {
  if (result.mode === "TRANSIT") return;
  const { route } = result;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`TEST: ${label}`);
  console.log(`Mode: ${result.mode}`);
  console.log(`${"=".repeat(60)}`);
  console.log("Origin:     ", JSON.stringify(route.origin));
  console.log(
    "Stops:      ",
    route.stops.length > 0
      ? route.stops
          .map((s, i) => `\n  Stop ${i + 1}: ${JSON.stringify(s)}`)
          .join("")
      : "None (direct route)",
  );
  console.log("Destination:", JSON.stringify(route.destination));
  console.log(`${"─".repeat(60)}`);
};

const logTransitResult = (label: string, result: OptimizedRouteResult) => {
  if (result.mode !== "TRANSIT") return;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`TEST: ${label}`);
  console.log(`Mode: TRANSIT`);
  console.log(`${"=".repeat(60)}`);
  result.segments.forEach((seg, i) => {
    console.log(`Leg ${i + 1}:`);
    console.log(`  Origin:      ${JSON.stringify(seg.origin)}`);
    console.log(`  Destination: ${JSON.stringify(seg.destination)}`);
  });
  console.log(`Total legs: ${result.segments.length}`);
  console.log(`${"─".repeat(60)}`);
};

// ── Test Runner ───────────────────────────────────────────────────────────────

export const runRouteOptimizerTests = async () => {
  console.log("\n🚀 Starting RouteOptimizer tests...\n");

  // Test 1: DRIVE — 2 destinations (no intermediate stops expected)
  try {
    const result = await getOptimizedRoute(
      KLCC,
      [SunwayPyramid, MidValley], // random order — Gemini should visit MidValley first
      "DRIVE",
    );
    logDriveResult("DRIVE — 2 destinations", result);
  } catch (e) {
    console.error("DRIVE 2-destination test failed:", e);
  }

  // Test 2: DRIVE — 4 destinations (3 stops + 1 final destination)
  try {
    const result = await getOptimizedRoute(
      KLCC,
      [SunwayPyramid, IKEACheras, MidValley, PavilionKL], // random order
      "DRIVE",
    );
    logDriveResult("DRIVE — 4 destinations", result);
  } catch (e) {
    console.error("DRIVE 4-destination test failed:", e);
  }

  // Test 3: TWO_WHEELER — same data as DRIVE test 2 to compare optimized order
  try {
    const result = await getOptimizedRoute(
      KLCC,
      [SunwayPyramid, IKEACheras, MidValley, PavilionKL], // same random order
      "TWO_WHEELER",
    );
    logDriveResult("TWO_WHEELER — 4 destinations", result);
  } catch (e) {
    console.error("TWO_WHEELER 4-destination test failed:", e);
  }

  // Test 4: TRANSIT — 2 destinations (2 legs expected)
  try {
    const result = await getOptimizedRoute(
      KLCC,
      [KLSentral, BukitBintangMRT], // random order
      "TRANSIT",
    );
    logTransitResult("TRANSIT — 2 destinations", result);
  } catch (e) {
    console.error("TRANSIT 2-destination test failed:", e);
  }

  // Test 5: TRANSIT — 3 destinations (3 legs expected, chained)
  try {
    const result = await getOptimizedRoute(
      KLCC,
      [KLSentral, MasjidJamek, BukitBintangMRT], // random order
      "TRANSIT",
    );
    logTransitResult("TRANSIT — 3 destinations", result);
  } catch (e) {
    console.error("TRANSIT 3-destination test failed:", e);
  }

  console.log("\n✅ All RouteOptimizer tests complete.\n");
};

export const runDriveROTest = async () => {
  // Test 2: DRIVE — 4 destinations (3 stops + 1 final destination)
  try {
    const result = await getOptimizedRoute(
      KLCC,
      [SunwayPyramid, IKEACheras, MidValley, PavilionKL], // random order
      "DRIVE",
    );
    logDriveResult("DRIVE — 4 destinations", result);
  } catch (e) {
    console.error("DRIVE 4-destination test failed:", e);
  }
};

export const runTwoWheelerROTest = async () => {
  // Test 3: TWO_WHEELER — same data as DRIVE test 2 to compare optimized order
  try {
    const result = await getOptimizedRoute(
      KLCC,
      [SunwayPyramid, IKEACheras, MidValley, PavilionKL], // same random order
      "TWO_WHEELER",
    );
    logDriveResult("TWO_WHEELER — 4 destinations", result);
  } catch (e) {
    console.error("TWO_WHEELER 4-destination test failed:", e);
  }
};

export const runTransitROTest = async () => {
  // Test 5: TRANSIT — 3 destinations (3 legs expected, chained)
  try {
    const result = await getOptimizedRoute(
      KLCC,
      [KLSentral, MasjidJamek, BukitBintangMRT], // random order
      "TRANSIT",
    );
    logTransitResult("TRANSIT — 3 destinations", result);
  } catch (e) {
    console.error("TRANSIT 3-destination test failed:", e);
  }
};
