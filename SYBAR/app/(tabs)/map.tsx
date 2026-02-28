import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Alert,
  ActivityIndicator,
  Button,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
  Polyline,
} from "react-native-maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import LocationSearchBar from "../../components/ui/LocationSearchBar";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fetchRouteData } from "@/services/RouteService";
import { LatLng, RouteRequest, RouteResponse } from "@/types/routes";
import { ROUTE_WAYPOINTS, getWaypointStyle } from "@/types/routeMarkers";
import { RouteDetailsCard } from "@/components/ui/RouteDetailsCard";
import {
  ChevronLeft,
  Car,
  Bike, // Using Bike icon for Motorcycle
  Bus,
  Plus,
  Minus,
  Search,
  Check,
  X,
} from "lucide-react-native";
import {
  drive_multi,
  drive_multi_dt,
  drive_simple,
  transit,
  transit_dt,
  two_wheeler_multi,
  two_wheeler_multi_dt,
  two_wheeler_simple,
} from "@/services/TestData";

// Define the keys from the app.config.js 'extra' section
const { googleMapsApiKeyAndroid, googleMapsApiKeyIos } =
  Constants.expoConfig?.extra || {};
// Automatically select the correct key for the Search API
const GOOGLE_PLACES_API_KEY = Platform.select({
  ios: googleMapsApiKeyIos,
  android: googleMapsApiKeyAndroid,
}) as string;

console.log("Platform:", Platform.OS);
console.log(
  "API Key loaded:",
  GOOGLE_PLACES_API_KEY ? "YES" : "NO - KEY IS UNDEFINED",
);

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [loading, setLoading] = useState(true);

  // Set initial state to the Malaysia fallback
  const MALAYSIA_FALLBACK: Region = {
    latitude: 3.139,
    longitude: 101.6869,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };
  const [region, setRegion] = useState<Region>(MALAYSIA_FALLBACK);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [placeId, setPlaceId] = useState("");
  const [address, setAddress] = useState("");
  const [activeRoute, setActiveRoute] = useState<RouteResponse | null>(null);
  const [finalRouteData, setFinalRouteData] = useState<any>(null);

  // Route Planning UI State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [transportMode, setTransportMode] = useState("DRIVE"); // 'DRIVE', 'TWO_WHEELER', 'TRANSIT'
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Destinations State
  const [origin, setOrigin] = useState({
    address: "Current Location",
    region: null as Region | null,
    placeId: "",
  });
  const [destinations, setDestinations] = useState([
    { id: 1, address: "", region: null as Region | null, placeId: "" },
  ]);

  // Active Search State (null = not searching, 0 = searching origin, 1+ = searching destination index)
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null,
  );
  const [tempSelection, setTempSelection] = useState<any>(null); // Holds location before confirmation

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    console.log("initializeLocation: starting...");
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission status:", status);

      if (status !== "granted") {
        console.log("Permission denied. Using KL fallback.");
        Alert.alert(
          "Permission Denied",
          "Please enable location services to access your location.",
        );
        setRegion(MALAYSIA_FALLBACK);
        setHasLocationPermission(false);
        return;
      }

      console.log("Permission granted. Fetching GPS coordinates...");
      // First pass: get a quick position to show the map immediately
      // This may be inaccurate if GPS just turned on
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      console.log(
        "Initial position accuracy:",
        location.coords.accuracy,
        "metres",
      );

      // Show map immediately with rough position
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });

      // Second pass: wait for a high-accuracy fix before geocoding
      // accuracy property is in metres — lower is better
      // 50m is a reasonable threshold for street-level address accuracy
      const ACCURACY_THRESHOLD_METRES = 50;
      const MAX_WAIT_MS = 15000; // give up after 15 seconds

      if (
        location.coords.accuracy &&
        location.coords.accuracy > ACCURACY_THRESHOLD_METRES
      ) {
        console.log(
          `Accuracy ${location.coords.accuracy}m exceeds threshold. Waiting for better fix...`,
        );
        try {
          // watchPositionAsync streams position updates as GPS improves
          let subscriber: Location.LocationSubscription | null = null;
          const accurateLocation = await Promise.race([
            // Stream updates and resolve when accuracy is good enough
            new Promise<Location.LocationObject>((resolve) => {
              Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 0 },
                (updatedLocation) => {
                  console.log(
                    "GPS update — accuracy:",
                    updatedLocation.coords.accuracy,
                    "metres",
                  );
                  if (
                    updatedLocation.coords.accuracy &&
                    updatedLocation.coords.accuracy <= ACCURACY_THRESHOLD_METRES
                  ) {
                    console.log("Accuracy threshold met.");
                    subscriber?.remove();
                    resolve(updatedLocation);
                  }
                },
              ).then((sub) => {
                subscriber = sub;
              });
            }),

            // Timeout fallback — use whatever we have after MAX_WAIT_MS
            new Promise<Location.LocationObject>((resolve) =>
              setTimeout(() => {
                console.warn(
                  "GPS accuracy timeout. Using best available position.",
                );
                subscriber?.remove();
                resolve(location);
              }, MAX_WAIT_MS),
            ),
          ]);

          // Update map to the more accurate position
          setRegion({
            latitude: accurateLocation.coords.latitude,
            longitude: accurateLocation.coords.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          });
          console.log(
            "Final accurate region:",
            JSON.stringify(region, null, 2),
          );
          location = accurateLocation;
        } catch (watchError) {
          console.warn("watchPositionAsync error:", watchError);
          // Continue with the initial rough fix
        }
      } else {
        console.log(
          `Accuracy ${location.coords.accuracy}m is within threshold. Proceeding.`,
        );
      }

      setHasLocationPermission(true);

      // Use Google Geocoding API for accurate address
      await reverseGeocodeWithGoogle(
        location.coords.latitude,
        location.coords.longitude,
      );
    } catch (error) {
      console.error("initializeLocation error:", error);
      setRegion(MALAYSIA_FALLBACK);
    } finally {
      console.log("initializeLocation: done.");
      setLoading(false);
    }
  };

  const reverseGeocodeWithGoogle = async (
    latitude: number,
    longitude: number,
  ) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}&language=en&region=MY`;
      const response = await fetch(url);
      const json = await response.json();
      console.log("Geocoding API status:", json.status);

      if (json.status === "OK" && json.results.length > 0) {
        // results[0] is the most precise address (street level)
        const fullPlaceId = json.results[0].place_id;
        const fullAddress = json.results[0].formatted_address;
        console.log("Current placeId from API: ", fullPlaceId);
        console.log("Current address from API: ", fullAddress);
        setPlaceId(fullPlaceId);
        setAddress(fullAddress);
      } else {
        console.warn("Geocoding API returned no results:", json.status);
      }
    } catch (error) {
      console.error("Geocoding API error:", error);
    }
  };

  // Called by LocationSearchBar when user selects a location
  const handleLocationSelect = (
    newRegion: Region,
    selectedPlaceId: string,
    selectedAddress: string,
  ) => {
    console.log("Selected place_id: ", selectedPlaceId);
    console.log("Location selected: ", selectedAddress);
    setRegion(newRegion);
    setPlaceId(selectedPlaceId);
    setAddress(selectedAddress);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const handleFetchRoute = async (request: RouteRequest) => {
    try {
      const result = await fetchRouteData(request);
      setActiveRoute(result);
      setFinalRouteData(result);

      // Auto-fit the map to show the entire route
      mapRef.current?.fitToCoordinates(result.routeCoord, {
        edgePadding: { top: 80, right: 40, bottom: 80, left: 40 },
        animated: true,
      });
    } catch (err) {
      Alert.alert("Error", "Could not calculate route.");
    }
  };

  // --- Destination Logic ---
  const addDestination = () => {
    if (destinations.length < 9) {
      setDestinations([
        ...destinations,
        { id: Date.now(), address: "", region: null, placeId: "" },
      ]);
    }
  };

  const removeDestination = () => {
    if (destinations.length > 1) {
      setDestinations(destinations.slice(0, -1));
    }
  };

  // --- Search Logic ---
  const handleTempLocationSelect = (
    newRegion: Region,
    selectedPlaceId: string,
    selectedAddress: string,
  ) => {
    console.log("Selected place_id: ", selectedPlaceId);
    console.log("Location selected: ", selectedAddress);
    setTempSelection({
      region: newRegion,
      placeId: selectedPlaceId,
      address: selectedAddress,
    });
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const confirmLocation = () => {
    if (!tempSelection || activeSearchIndex === null) return;

    if (activeSearchIndex === 0) {
      setOrigin(tempSelection);
    } else {
      const newDestinations = [...destinations];
      newDestinations[activeSearchIndex - 1] = {
        ...newDestinations[activeSearchIndex - 1],
        ...tempSelection,
      };
      setDestinations(newDestinations);
    }

    // Reset search state and reopen panel
    setTempSelection(null);
    setActiveSearchIndex(null);
    setIsPanelOpen(true);
  };

  const cancelLocation = () => {
    setTempSelection(null);
    setActiveSearchIndex(null);
    setIsPanelOpen(true);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF9F43" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View className="flex-1 relative bg-white">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={hasLocationPermission} // Blue dot only if permitted
          showsMyLocationButton={hasLocationPermission && !isPanelOpen} // Shows the "Center on Me" button if permitted
        >
          {/* <Marker coordinate={region} title="Current Location" /> */}
          {/* Show markers for origin and destinations if set */}
          {origin.region && (
            <Marker coordinate={origin.region} pinColor="red" title="Start" />
          )}
          {destinations.map(
            (dest, index) =>
              dest.region && (
                <Marker
                  key={dest.id}
                  coordinate={dest.region}
                  pinColor="blue"
                  title={`Destination ${index + 1}`}
                />
              ),
          )}
          {/* Show temporary marker during active search */}
          {tempSelection?.region && (
            <Marker coordinate={tempSelection.region} pinColor="orange" />
          )}

          {/* Show route on map */}
          {activeRoute ? (
            // ── Route is active: render polyline + all stop markers ──
            <>
              <Polyline
                coordinates={activeRoute.routeCoord}
                strokeColor="#FF9F43"
                strokeWidth={4}
              />

              {activeRoute.allStopCoordinates.map((coord, index) => {
                const style = getWaypointStyle(
                  index,
                  activeRoute.allStopCoordinates.length,
                );
                return (
                  <Marker
                    key={`stop-${index}`}
                    coordinate={coord}
                    title={style.label}
                    pinColor={style.color}
                  />
                );
              })}
            </>
          ) : (
            // ── No route yet: show the user's current location marker ──
            // Only render if location permission was denied (blue dot handles it otherwise)
            !hasLocationPermission && (
              <Marker
                coordinate={region}
                title="Current Location"
                pinColor="#E74C3C"
              />
            )
          )}
        </MapView>

        {/* DEFAULT TOP BAR (Triggers the Panel) */}
        {!isPanelOpen && activeSearchIndex === null && (
          <View className="absolute top-4 w-full px-5">
            <TouchableOpacity
              onPress={() => setIsPanelOpen(true)}
              className="flex-row items-center bg-white px-5 py-4 rounded-full shadow-lg border border-gray-100"
            >
              <Search color="#2563EB" size={22} />
              <Text className="ml-3 text-base text-[#64748B] font-medium">
                Where are we routing today?
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ACTIVE SEARCH OVERLAY (Top Search Bar + Bottom Confirm/Cancel) */}
        {activeSearchIndex !== null && (
          <View className="absolute top-0 w-full h-full pointer-events-box-none">
            {/* Top Search Bar */}
            <View className="w-full px-5 pt-4 bg-transparent pointer-events-auto">
              <LocationSearchBar
                apiKey={GOOGLE_PLACES_API_KEY}
                placeholder={
                  activeSearchIndex === 0
                    ? "Search Starting Point..."
                    : `Search Destination ${activeSearchIndex}...`
                }
                onLocationSelect={handleTempLocationSelect}
              />
            </View>
          </View>
        )}
      </View>

      {/* PLAN YOUR ROUTE PANEL (Slide over) */}
      {isPanelOpen && (
        <View className="absolute top-0 left-0 w-full h-full bg-[#F8FAFC] z-50 pt-12 px-5 pb-5">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-3xl font-black text-[#0F172A]">
              Plan Your Route
            </Text>
            <TouchableOpacity
              onPress={() => setIsPanelOpen(false)}
              className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <ChevronLeft color="#0F172A" size={28} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Vehicle Type Selection */}
            <View className="bg-white p-5 rounded-3xl border border-gray-200 mb-5 shadow-sm">
              <Text className="text-base font-bold text-[#0F172A] mb-4">
                Vehicle Type
              </Text>
              <View className="flex-row justify-between">
                {[
                  { id: "DRIVE", icon: Car, label: "Car" },
                  { id: "TWO_WHEELER", icon: Bike, label: "Motorcycle" },
                  { id: "TRANSIT", icon: Bus, label: "Transit" },
                ].map((mode) => {
                  const isActive = transportMode === mode.id;
                  return (
                    <TouchableOpacity
                      key={mode.id}
                      onPress={() => setTransportMode(mode.id)}
                      className={`flex-1 items-center justify-center py-4 rounded-2xl mx-1 border-2 
                        ${isActive ? "bg-[#0F172A] border-[#0F172A]" : "bg-white border-gray-200"}`}
                    >
                      <mode.icon
                        color={isActive ? "white" : "#0F172A"}
                        size={28}
                        className="mb-2"
                      />
                      <Text
                        className={`font-bold text-sm ${isActive ? "text-white" : "text-[#0F172A]"}`}
                      >
                        {mode.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Number of Stops / Destinations */}
            <View className="bg-white p-5 rounded-3xl border border-gray-200 mb-5 shadow-sm">
              <Text className="text-base font-bold text-[#0F172A] mb-4">
                Number of Destinations
              </Text>
              <View className="flex-row items-center justify-center gap-x-8">
                <TouchableOpacity
                  onPress={removeDestination}
                  className="p-3 bg-gray-100 rounded-xl border border-gray-200"
                >
                  <Minus color="#0F172A" size={24} />
                </TouchableOpacity>
                <Text className="text-3xl font-black text-[#0F172A]">
                  {destinations.length}
                </Text>
                <TouchableOpacity
                  onPress={addDestination}
                  className="p-3 bg-gray-100 rounded-xl border border-gray-200"
                >
                  <Plus color="#0F172A" size={24} />
                </TouchableOpacity>
              </View>

              {/* Date & Time Picker */}
              <View className="mt-6 flex-row justify-between gap-x-3">
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-1 py-3 bg-blue-50 rounded-xl border border-[#2563EB] items-center"
                >
                  <Text className="text-[#2563EB] font-bold">
                    {dateTime.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="flex-1 py-3 bg-blue-50 rounded-xl border border-[#2563EB] items-center"
                >
                  <Text className="text-[#2563EB] font-bold">
                    {dateTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Native DateTime Pickers */}
              {showDatePicker && (
                <DateTimePicker
                  value={dateTime}
                  mode="date"
                  minimumDate={new Date()} // Prevent past dates
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDateTime(selectedDate);
                  }}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={dateTime}
                  mode="time"
                  minimumDate={new Date()} // Prevent past times
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowTimePicker(false);
                    if (selectedDate) setDateTime(selectedDate);
                  }}
                />
              )}
            </View>

            {/* Locations Inputs */}
            <Text className="text-lg font-bold text-[#0F172A] mb-3 ml-2">
              Enter Locations
            </Text>

            {/* Origin Input (Index 0) */}
            <TouchableOpacity
              onPress={() => {
                setActiveSearchIndex(0);
                setIsPanelOpen(false);
              }}
              className="flex-row items-center bg-white p-4 rounded-2xl border-2 border-[#2563EB] mb-3 shadow-sm"
            >
              <View className="w-8 h-8 bg-[#2563EB] rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold">1</Text>
              </View>
              <Text
                className={`flex-1 ${origin.address === "Current Location" ? "text-gray-400" : "text-[#0F172A] font-medium"}`}
                numberOfLines={1}
              >
                {origin.address || "Starting point"}
              </Text>
            </TouchableOpacity>

            {/* Destination Inputs (Index 1 to 9) */}
            {destinations.map((dest, index) => (
              <TouchableOpacity
                key={dest.id}
                onPress={() => {
                  setActiveSearchIndex(index + 1);
                  setIsPanelOpen(false);
                }}
                className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-300 mb-3 shadow-sm"
              >
                <View className="w-8 h-8 bg-[#0F172A] rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold">{index + 2}</Text>
                </View>
                <Text
                  className={`flex-1 ${!dest.address ? "text-gray-400" : "text-[#0F172A] font-medium"}`}
                  numberOfLines={1}
                >
                  {dest.address || `Destination ${index + 1}`}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Find Route Action Button */}
            <TouchableOpacity className="bg-[#0F172A] py-5 rounded-full items-center mt-6 shadow-md border-2 border-[#1E293B]">
              <Text className="text-white font-black text-lg tracking-wide">
                Find Route
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* The Route Details Card */}
      {finalRouteData && <RouteDetailsCard data={finalRouteData} />}

      {/* Drop in the reusable component — pass API key and selection handler */}
      {/* <LocationSearchBar
        apiKey={GOOGLE_PLACES_API_KEY}
        placeholder="Starting Point"
        onLocationSelect={handleLocationSelect}
      /> */}

      {/* <Button
        title="Run Drive Simple"
        onPress={() => fetchRouteData(drive_simple)}
      /> */}
      {/* <Button
        title="Run Drive Multi"
        onPress={() => handleFetchRoute(drive_multi)}
      />
      <Button
        title="Run Drive Multi DT"
        onPress={() => handleFetchRoute(drive_multi_dt)}
      /> */}
      {/* <Button
        title="Run Two Wheel Simple"
        onPress={() => handleFetchRoute(two_wheeler_simple)}
      />
      <Button
        title="Run Two Wheel Multi"
        onPress={() => handleFetchRoute(two_wheeler_multi)}
      />
      <Button
        title="Run Two Wheel Multi DT"
        onPress={() => handleFetchRoute(two_wheeler_multi_dt)}
      />
      <Button title="Run Transit" onPress={() => handleFetchRoute(transit)} />
      <Button
        title="Run Transit DT"
        onPress={() => handleFetchRoute(transit_dt)}
      /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
