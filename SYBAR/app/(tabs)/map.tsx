import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Alert,
  ActivityIndicator,
  Button,
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
import LocationSearchBar from "../../components/ui/LocationSearchBar";
import { fetchRouteData } from "@/services/RouteService";
import { LatLng, RouteRequest, RouteResponse } from "@/types/routes";
import { ROUTE_WAYPOINTS, getWaypointStyle } from "@/types/routeMarkers";
import { RouteDetailsCard } from "@/components/ui/RouteDetailsCard";
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

  // Called by StartingPointBar when user selects a location
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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF9F43" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={hasLocationPermission} // Blue dot only if permitted
        showsMyLocationButton={hasLocationPermission} // Shows the "Center on Me" button if permitted
      >
        {/* <Marker coordinate={region} title="Current Location" /> */}

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
            {/* Destination marker — last coordinate of the polyline */}
            {/* <Marker
              coordinate={
                activeRoute.routeCoord[activeRoute.routeCoord.length - 1]
              }
              title="Destination"
              pinColor="green"
            /> */}
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

      {/* The Route Details Card */}
      {finalRouteData && <RouteDetailsCard data={finalRouteData} />}

      {/* Drop in the reusable component — pass API key and selection handler */}
      {/* <LocationSearchBar
        apiKey={GOOGLE_PLACES_API_KEY}
        placeholder="Starting Point"
        onLocationSelect={handleLocationSelect}
      /> */}

      <Button
        title="Run Drive Simple"
        onPress={() => fetchRouteData(drive_simple)}
      />
      <Button
        title="Run Drive Multi"
        onPress={() => handleFetchRoute(drive_multi)}
      />
      <Button
        title="Run Drive Multi DT"
        onPress={() => handleFetchRoute(drive_multi_dt)}
      />
      <Button
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
