export interface WaypointStyle {
  color: string;
  label: string;
}

// 10 visually distinct colors for up to 10 points (origin + 8 stops + destination)
export const ROUTE_WAYPOINTS: WaypointStyle[] = [
  { color: "#E74C3C", label: "Starting Point" }, // index 0 — red
  { color: "#2980B9", label: "Stop 1" }, // index 1 — medium blue
  { color: "#F39C12", label: "Stop 2" }, // index 2 — purple amber
  { color: "#8E44AD", label: "Stop 3" }, // index 3 — purple
  { color: "#16A085", label: "Stop 4" }, // index 4 — dark teal
  { color: "#ff6600", label: "Stop 5" }, // index 5 — orange
  { color: "#800000", label: "Stop 6" }, // index 6 — maroon
  { color: "#1A5276", label: "Stop 7" }, // index 7 — navy
  { color: "#7D6608", label: "Stop 8" }, // index 8 — dark purple
  { color: "#2ECC71", label: "Destination" }, // index 9 — green (always last)
];

// Helper — Maps total stop count to the correct label for the destination
const getDestinationLabel = (): WaypointStyle =>
  ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1];

export const getWaypointStyle = (
  index: number,
  totalPoints: number,
): WaypointStyle => {
  if (totalPoints < 2) {
    console.warn("getWaypointStyle: totalPoints must be at least 2");
    return { color: "#95A5A6", label: "Point" };
  }

  // Last point always gets Destination style regardless of index value
  if (index === totalPoints - 1) {
    return getDestinationLabel();
  }
  // Last point is always "Destination"
  if (index === totalPoints - 1) {
    return ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1];
  }

  // Intermediate stops (index 1 to totalPoints-2) get Stop 1, Stop 2, etc.
  // but we relabel them sequentially so the displayed label always matches
  // the visual order, not the raw array index
  if (index > 0) {
    const stopStyle = ROUTE_WAYPOINTS[index];
    return stopStyle
      ? { ...stopStyle, label: `Stop ${index}` } // enforce sequential label
      : { color: "#95A5A6", label: `Stop ${index}` };
  }

  // Index 0 is always Starting Point
  return ROUTE_WAYPOINTS[0];
};
