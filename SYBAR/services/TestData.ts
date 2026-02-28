import { RouteRequest } from "@/types/routes";

// Test Data
export const drive_simple: RouteRequest = {
  origin: { latitude: 3.1579, longitude: 101.7123 }, // KLCC
  destination: { latitude: 3.1187, longitude: 101.6775 }, // Mid Valley
  travelMode: "DRIVE",
  departureTime: new Date("2026-03-01T08:30:00Z"), // Monday morning rush
};

export const drive_multi: RouteRequest = {
  origin: { latitude: 3.1579, longitude: 101.7123 }, // KLCC
  stops: [
    { latitude: 3.1478, longitude: 101.71 }, // Pavilion KL
    { latitude: 3.123, longitude: 101.715 }, // IKEA Cheras
  ],
  destination: { latitude: 3.0641, longitude: 101.6067 }, // Sunway Pyramid
  travelMode: "DRIVE",
  departureTime: null, // On-the-spot
};

export const drive_multi_dt: RouteRequest = {
  origin: { latitude: 3.1579, longitude: 101.7123 }, // KLCC
  stops: [
    { latitude: 3.1478, longitude: 101.71 }, // Pavilion KL
    { latitude: 3.123, longitude: 101.715 }, // IKEA Cheras
  ],
  destination: { latitude: 3.0641, longitude: 101.6067 }, // Sunway Pyramid
  travelMode: "DRIVE",
  departureTime: new Date("2026-03-01T08:30:00Z"), // Monday morning rush
};

export const two_wheeler_simple: RouteRequest = {
  origin: { latitude: 3.1579, longitude: 101.7123 }, // KLCC
  destination: { latitude: 3.1187, longitude: 101.6775 }, // Mid Valley
  travelMode: "TWO_WHEELER",
  departureTime: new Date("2026-03-01T08:30:00Z"), // Monday morning rush
};

export const two_wheeler_multi: RouteRequest = {
  origin: { latitude: 3.1579, longitude: 101.7123 }, // KLCC
  stops: [
    { latitude: 3.1478, longitude: 101.71 }, // Pavilion KL
    { latitude: 3.123, longitude: 101.715 }, // IKEA Cheras
  ],
  destination: { latitude: 3.0641, longitude: 101.6067 }, // Sunway Pyramid
  travelMode: "TWO_WHEELER",
  departureTime: null, // On-the-spot
};

export const two_wheeler_multi_dt: RouteRequest = {
  origin: { latitude: 3.1579, longitude: 101.7123 }, // KLCC
  stops: [
    { latitude: 3.1478, longitude: 101.71 }, // Pavilion KL
    { latitude: 3.123, longitude: 101.715 }, // IKEA Cheras
  ],
  destination: { latitude: 3.0641, longitude: 101.6067 }, // Sunway Pyramid
  travelMode: "TWO_WHEELER",
  departureTime: new Date("2026-03-01T08:30:00Z"), // Monday morning rush
};

export const transit: RouteRequest = {
  origin: { latitude: 3.1579, longitude: 101.7123 }, // KLCC
  destination: { latitude: 3.1385, longitude: 101.6169 }, // 1 Utama
  travelMode: "TRANSIT",
  departureTime: null,
};

export const transit_dt: RouteRequest = {
  origin: { latitude: 3.1579, longitude: 101.7123 }, // KLCC
  destination: { latitude: 3.1385, longitude: 101.6169 }, // 1 Utama
  travelMode: "TRANSIT",
  departureTime: new Date("2026-03-01T17:30:00Z"),
};

/*** Request body with fuelConsumption

const body: any = {
  origin: { location: { latLng: origin } },
  destination: { location: { latLng: destination } },
  travelMode: mode,
  // Fuel consumption requires OPTIMAL preference
  routingPreference: "TRAFFIC_AWARE_OPTIMAL", 
  extraComputations: ["FUEL_CONSUMPTION"],
  routeModifiers: {
    vehicleInfo: {
      emissionType: "GASOLINE" // You can make this a user setting later
    }
  }
};

// Update your FieldMask to include the advisory
const fieldMask = 'routes.duration,routes.polyline,routes.travelAdvisory.fuelConsumptionMicroliters';
*/

/*** Dummy Coordinates

* Set 1 (Simple)
KLCC -> Mid Valley
Start: (3.1579, 101.7123)
End: (3.1187, 101.6775)

* Set 2 (Multi)
KLCC -> Pavillion -> IKEA -> Sunway
Start: (3.1579, 101.7123)
Stops: [(3.1478, 101.7100), (3.1230, 101.7150)]
End: (3.0641, 101.6067)

* Set 3 (Transit)
KLCC -> 1 Utama (LRT/Bus)
Start: (3.1579, 101.7123)
End: (3.1385, 101.6169)

*/