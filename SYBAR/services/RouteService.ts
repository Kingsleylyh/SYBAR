import { LatLng, RouteRequest, RouteResponse } from "@/types/routes";
import Constants from "expo-constants";
import { Platform } from "react-native";
import polyline from "@mapbox/polyline";

const { googleMapsApiKeyAndroid, googleMapsApiKeyIos } =
  Constants.expoConfig?.extra || {};
const API_KEY = Platform.select({
  ios: googleMapsApiKeyIos,
  android: googleMapsApiKeyAndroid,
}) as string;
const ROUTES_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

const parseDuration = (d: string): number => parseInt(d.replace("s", ""), 10);

export const decodePath = (encodedStr: string) => {
  const points = polyline.decode(encodedStr);

  // Map the [lat, lng] array into objects for React Native Maps
  return points.map((point) => ({
    latitude: point[0],
    longitude: point[1],
  }));
};

export const fetchRouteData = async (
  params: RouteRequest,
): Promise<RouteResponse> => {
  const {
    origin,
    destination,
    stops,
    travelMode,
    departureTime,
    // optimizeWaypoints,
  } = params;

  // 1. Construct the Request Body
  const body: any = {
    origin: { location: { latLng: origin } },
    destination: { location: { latLng: destination } },
    travelMode: travelMode,
    languageCode: "en-US",
    units: "METRIC",
  };

  /* 
  // Handle Pre-planning vs On-the-spot
  // routingPreference is incompatible with TRANSIT
  */
  if (travelMode !== "TRANSIT") {
    body.routingPreference = departureTime
      ? "TRAFFIC_AWARE_OPTIMAL"
      : "TRAFFIC_AWARE";
  }

  // Add intermediate stops (Waypoints) - Max 8 for your project
  if (stops && stops.length > 0 && travelMode !== "TRANSIT") {
    body.intermediates = stops.map((point) => ({
      location: { latLng: point },
    }));
    // body.optimizeWaypointOrder = optimizeWaypoints || false;
  }

  // Add Departure Time for Pre-Planning
  if (departureTime) {
    body.departureTime = departureTime.toISOString();
  }

  // 2. Define the Field Mask (Crucial for receiving specific data)
  const fieldMask = [
    "routes.duration",
    "routes.staticDuration",
    "routes.distanceMeters",
    "routes.polyline.encodedPolyline",
    "routes.legs", // Provides info for each stop segment
    "routes.legs.duration",
    "routes.legs.staticDuration",
    "routes.legs.distanceMeters",
    "routes.legs.startLocation",
    "routes.legs.endLocation",
    "routes.legs.steps.navigationInstruction", // required for turn-by-turn
    "routes.legs.steps.distanceMeters",
  ].join(",");

  try {
    const response = await fetch(ROUTES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("API error response:", JSON.stringify(data, null, 2));
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No routes found.");
    }

    const route = data.routes[0];

    // Decode the polyline
    const coordinates = polyline
      .decode(route.polyline.encodedPolyline)
      .map(([lat, lng]) => ({ latitude: lat, longitude: lng }));

    // After decoding the polyline, build the ordered stop list from params
    const allStopCoordinates: LatLng[] = [
      origin,
      ...(stops ?? []),
      destination,
    ];

    console.log("Polyline:", route.polyline.encodedPolyline);
    console.log("DistanceRaw: ", route.distanceMeters);
    console.log("DistanceKm:", route.distanceMeters / 1000);
    console.log("DurationRaw: ", route.duration);
    console.log("DurationMins:", Math.ceil(parseDuration(route.duration) / 60));
    console.log(
      "StaticDurationRaw:",
      route.staticDuration ? route.staticDuration : undefined,
    );
    console.log(
      "StaticDurationMins:",
      route.staticDuration
        ? Math.ceil(parseDuration(route.staticDuration) / 60)
        : undefined,
    );
    console.log("Legs:", route.legs);
    console.log("RouteCoord:", coordinates);

    // 3. Clean and Return the Response
    return {
      polyline: route.polyline.encodedPolyline,
      distanceKm: route.distanceMeters / 1000,
      durationMins: Math.ceil(parseDuration(route.duration) / 60),
      staticDurationMins: route.staticDuration
        ? Math.ceil(parseDuration(route.staticDuration) / 60)
        : undefined,
      legs: route.legs,
      routeCoord: coordinates,
      allStopCoordinates,
    };
  } catch (error) {
    console.error("Routes API Error:", error);
    throw error;
  }
};

/*

// Sample Implementation

const handleCalculate = async () => {
  try {
    const routeData = await fetchRouteData({
      origin: startingPoint.coords,
      destination: destinationPoint.coords,
      stops: listOfStops.map(s => s.coords), // Your 1-8 stops
      travelMode: selectedMode,
      departureTime: isPrePlanning ? selectedDateTime : undefined,
      optimizeWaypoints: true,
    });

    // Save result to state to draw on map and show in "Route Card"
    setFinalRoute(routeData);
  } catch (err) {
    Alert.alert("Error", "Could not calculate route.");
  }
};

*/
