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
import {
  LatLng,
  LocationData,
  RouteRequest,
  RouteResponse,
  MergedRouteResponse,
} from "@/types/routes";
import { getOptimizedRoute } from "@/services/RouteOptimizer";
import { buildAndFetchRoute } from "@/services/RouteBuilder";
import { ROUTE_WAYPOINTS, getWaypointStyle } from "@/types/routeMarkers";
import { RouteDetailsCard } from "@/components/ui/RouteDetailsCard";
import {
  ChevronLeft,
  Car,
  Bike, 
  Bus,
  Plus,
  Minus,
  Search,
  Check,
  X,
} from "lucide-react-native";
import * as LocationTestData from "@/services/TestData";
import {
  runRouteOptimizerTests,
  runDriveROTest,
  runTransitROTest,
  runTwoWheelerROTest,
} from "@/services/TestRouteOptimizer";

const { googleMapsApiKeyAndroid, googleMapsApiKeyIos } =
  Constants.expoConfig?.extra || {};
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
  const [activeRoute, setActiveRoute] = useState<MergedRouteResponse | null>(
    null,
  );
  const [finalRouteData, setFinalRouteData] = useState<any>(null);

  // Route Planning UI State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [transportMode, setTransportMode] = useState("DRIVE"); 
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
  const [tempSelection, setTempSelection] = useState<any>(null); 

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
      const MAX_WAIT_MS = 15000; 

      if (
        location.coords.accuracy &&
        location.coords.accuracy > ACCURACY_THRESHOLD_METRES
      ) {
        console.log(
          `Accuracy ${location.coords.accuracy}m exceeds threshold. Waiting for better fix...`,
        );
        try {
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

      mapRef.current?.fitToCoordinates(result.routeCoord, {
        edgePadding: { top: 80, right: 40, bottom: 80, left: 40 },
        animated: true,
      });
    } catch (err) {
      Alert.alert("Error", "Could not calculate route.");
    }
  };

  const handleOptimizeAndFetch = async (
    start: LocationData,
    destinations: LocationData[],
    mode: "DRIVE" | "TWO_WHEELER" | "TRANSIT",
    departureTime: Date | null,
  ) => {
    try {
      const optimized = await getOptimizedRoute(start, destinations, mode);
      console.log(
        "Optimized result from Gemini:",
        JSON.stringify(optimized, null, 2),
      );

      const route = await buildAndFetchRoute(optimized, departureTime);
      console.log("Final merged route:", JSON.stringify(route, null, 2));

      setActiveRoute(route);
      mapRef.current?.fitToCoordinates(route.routeCoord, {
        edgePadding: { top: 80, right: 40, bottom: 80, left: 40 },
        animated: true,
      });
    } catch (err) {
      console.error("Optimize and fetch error:", err);
      Alert.alert("Error", "Could not optimize or calculate route.");
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

  const clearLocations = () => {
    setOrigin({
      address: "Current Location",
      region: null,
      placeId: "",
    });
    setDestinations([
      { id: Date.now(), address: "", region: null, placeId: "" },
    ]);
    setActiveRoute(null);
  };

  const executeLiveRoute = () => {
    // 1. Validate that the user actually selected a starting point
    if (!origin.region) {
      Alert.alert("Missing Start Point", "Please select a starting location.");
      return;
    }

    // 2. Filter out any empty destination boxes the user didn't fill in
    const validDestinations = destinations.filter((dest) => dest.region !== null);

    if (validDestinations.length === 0) {
      Alert.alert("Missing Destination", "Please select at least one destination.");
      return;
    }

    // 3. Format the Origin into the required LocationData interface
    const startLocation: LocationData = {
      coordinates: {
        latitude: origin.region.latitude,
        longitude: origin.region.longitude,
      },
      name: origin.address,
      formattedAddress: origin.address,
    };

    // 4. Format the array of Destinations into LocationData interfaces
    const destLocations: LocationData[] = validDestinations.map((dest) => ({
      coordinates: {
        latitude: dest.region!.latitude,
        longitude: dest.region!.longitude,
      },
      name: dest.address,
      formattedAddress: dest.address,
    }));

    // 5. Close the side panel
    setIsPanelOpen(false);
    
    // --- NEW FIX: Prevent the "Timestamp in the past" API crash ---
    const now = new Date();
    // Add a 60-second buffer. If the time is in the past or too close to 'now', make it null.
    const isPastTime = dateTime.getTime() < (now.getTime() + 60000);
    const safeDepartureTime = isPastTime ? null : dateTime;

    // 6. Trigger the Gemini Optimization!
    handleOptimizeAndFetch(
      startLocation, 
      destLocations, 
      transportMode as "DRIVE" | "TWO_WHEELER" | "TRANSIT", 
      safeDepartureTime // <-- using the safe time variable here
    );
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

  // const runDriveRO = () => {
  //   const start = LocationTestData.KLCC;
  //   const destinations = [
  //     LocationTestData.SunwayPyramid,
  //     LocationTestData.IKEACheras,
  //     LocationTestData.MidValley,
  //     LocationTestData.PavilionKL,
  //   ];
  //   const travelMode = "DRIVE";
  //   handleOptimizeAndFetch(start, destinations, travelMode, null);
  //   setIsPanelOpen(false);
  // };

  // const runTwoWheelerRO = () => {
  //   const start = LocationTestData.KLCC;
  //   const destinations = [
  //     LocationTestData.SunwayPyramid,
  //     LocationTestData.IKEACheras,
  //     LocationTestData.MidValley,
  //     LocationTestData.PavilionKL,
  //   ];
  //   const travelMode = "TWO_WHEELER";
  //   handleOptimizeAndFetch(start, destinations, travelMode, null);
  //   setIsPanelOpen(false);
  // };

  // const runTransitRO = () => {
  //   const start = LocationTestData.KLCC;
  //   const destinations = [
  //     LocationTestData.KLSentral,
  //     LocationTestData.MasjidJamek,
  //     LocationTestData.BukitBintangMRT,
  //   ];
  //   const travelMode = "TRANSIT";
  //   handleOptimizeAndFetch(start, destinations, travelMode, null);
  //   setIsPanelOpen(false);
  // };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View className="flex-1 relative bg-white">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={hasLocationPermission} 
          showsMyLocationButton={hasLocationPermission && !isPanelOpen}
        >
 
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
            <>
              <Polyline
                coordinates={activeRoute.routeCoord}
                strokeColor="#0000FF"
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

        {/* ACTIVE SEARCH OVERLAY */}
        {activeSearchIndex !== null && (
          <View 
            className="absolute top-0 w-full h-full z-50 pointer-events-box-none"
            style={{ elevation: 10 }} 
          >
            {/* Top Search Bar */}
            <View className="w-full flex-1 px-5 pt-4 bg-transparent pointer-events-auto">
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

            {/* Confirm / Cancel buttons */}
            {tempSelection && (
              <View 
                className="absolute bottom-12 w-full flex-row justify-center gap-x-8"
                pointerEvents="box-none"
              >
                <TouchableOpacity 
                  onPress={cancelLocation} 
                  className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-xl border border-gray-100"
                >
                  <X color="#EF4444" size={32} strokeWidth={2.5} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={confirmLocation} 
                  className="w-16 h-16 bg-[#22C55E] rounded-full items-center justify-center shadow-xl border border-[#22C55E]"
                >
                  <Check color="#FFFFFF" size={32} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* PLAN YOUR ROUTE PANEL */}
        {isPanelOpen && (
          <View className="absolute top-0 left-0 w-full h-full bg-[#F8FAFC] z-50 pt-12 px-5 pb-5">
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
                    minimumDate={new Date()} 
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
                    minimumDate={new Date()}
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowTimePicker(false);
                      if (selectedDate) setDateTime(selectedDate);
                    }}
                  />
                )}
              </View>

              {/* Locations Inputs Header */}
              <View className="flex-row justify-between items-center mb-3 px-2">
                <Text className="text-lg font-bold text-[#0F172A]">
                  Enter Locations
                </Text>
                <TouchableOpacity onPress={clearLocations}>
                  <Text className="text-[#EF4444] font-bold text-sm">Clear All</Text>
                </TouchableOpacity>
              </View>

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
              <TouchableOpacity
                onPress={executeLiveRoute}
                className="bg-[#0F172A] py-5 rounded-full items-center mt-6 shadow-md border-2 border-[#1E293B]"
              >
                <Text className="text-white font-black text-lg tracking-wide">
                  Find Route
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>

      {/* The Route Details Card */}
      {activeRoute && <RouteDetailsCard data={activeRoute} />}
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
      {/* <Button title="Run Optimizer Tests" onPress={runRouteOptimizerTests} />
      <Button title="Run Drive RO Tests" onPress={runDriveRO} />
      <Button title="Run Two Wheeler RO Tests" onPress={runTwoWheelerRO} />
      <Button title="Run Transit RO Tests" onPress={runTransitRO} /> */}
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
