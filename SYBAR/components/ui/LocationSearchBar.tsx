import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Keyboard,
  Modal,
} from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlaceData,
  GooglePlaceDetail,
} from "react-native-google-places-autocomplete";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  apiKey: string;
  placeholder?: string;
  onLocationSelect: (
    region: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    },
    placeId: string,
    address: string,
  ) => void;
};

export default function LocationSearchBar({
  apiKey,
  placeholder = "Search location within Malaysia",
  onLocationSelect,
}: Props) {
  const autocompleteRef = useRef<any>(null);
  const [currentSessionToken, setCurrentSessionToken] = useState(generateToken);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [inputValue, setInputValue] = useState("");

  function generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  const handlePlaceSelect = (
    data: GooglePlaceData,
    details: GooglePlaceDetail | null = null,
  ) => {
    console.log("Place data:", JSON.stringify(data, null, 2));
    console.log("Place details:", JSON.stringify(details, null, 2));

    if (details) {
      console.log("Place name:", details.name);
      console.log("Formatted address:", details.formatted_address);
      console.log("Lat:", details.geometry.location.lat);
      console.log("Lng:", details.geometry.location.lng);

      const newPoint = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      const selectedText = data.description;
      autocompleteRef.current?.setAddressText(selectedText);
      setInputValue(selectedText);
      setCurrentSessionToken(generateToken()); // Refresh session for next search

      setTimeout(() => {
        autocompleteRef.current?.setAddressText(selectedText);
        autocompleteRef.current?.blur();
        setIsSearchActive(false);
        Keyboard.dismiss();
      }, 50);

      // Bubble up to parent
      onLocationSelect(newPoint, data.place_id, details.formatted_address);
    }
  };

  const handleBack = () => {
    autocompleteRef.current?.clear();
    autocompleteRef.current?.setAddressText(inputValue);
    setIsSearchActive(false);
    Keyboard.dismiss();
  };

  const handleClearInput = () => {
    autocompleteRef.current?.setAddressText("");
    setInputValue("");
    autocompleteRef.current?.focus();
  };

  return (
    /* Search overlay — full screen white background when active */
    <View
      style={[
        styles.searchContainer,
        isSearchActive && styles.searchContainerActive,
      ]}
    >
      {/*
          Single pill row containing:
          - Left: back arrow (active) OR search icon (inactive)
          - Middle: text input via renderLeftButton/renderRightButton
          - Right: clear X (active + has text)
          All injected via library props so they sit INSIDE the input row
        */}
      {/* Search Input Bar */}
      <GooglePlacesAutocomplete
        ref={autocompleteRef}
        placeholder={placeholder}
        debounce={1000} // Waits 1s after typing stops before calling API
        fetchDetails={true}
        query={{
          key: apiKey,
          language: "en",
          components: "country:my", // RESTRICTS SEARCH TO MALAYSIA
          sessiontoken: currentSessionToken, // Tells Google "this is one session"
        }}
        listViewDisplayed={isSearchActive}
        onPress={handlePlaceSelect}
        onFail={(error) => console.error("Places API error:", error)} // API-level errors
        onNotFound={() => console.warn("Places: No results found")} // Valid call, 0 results
        onTimeout={() => console.warn("Places: Request timed out")} // Timeout
        textInputProps={{
          onFocus: () => setIsSearchActive(true),
          onChangeText: (text) => setInputValue(text),
          onBlur: () => setIsSearchActive(false),
          // Moves cursor to the start when the input is not focused
          selection:
            !isSearchActive && inputValue.length > 0
              ? { start: 0, end: 0 }
              : undefined,
        }}
        renderLeftButton={() => (
          <View style={styles.leftButton}>
            {isSearchActive ? (
              <TouchableOpacity
                onPress={handleBack}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={20} color="#555" />
              </TouchableOpacity>
            ) : (
              <Ionicons name="search" size={16} color="#999" />
            )}
          </View>
        )}
        renderRightButton={() => (
          <View style={styles.rightButton}>
            {isSearchActive && inputValue.length > 0 && (
              <TouchableOpacity
                onPress={handleClearInput}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={18} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>
        )}
        styles={{
          container: isSearchActive
            ? styles.autocompleteContainerActive
            : styles.autocompleteContainer,
          textInputContainer: styles.textInputContainer,
          textInput: styles.searchInput,
          listView: styles.resultsList,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Floating bar when inactive
  searchContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    width: "90%",
    alignSelf: "center",
    zIndex: 1,
  },

  // Active: expand to cover the full screen with a white background
  searchContainerActive: {
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 12,
  },

  // Pill shape when inactive, square when active
  // Inactive: pill with shadow, height locked to input row only
  autocompleteContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },

  // Active: square with orange border, allow full height for list
  autocompleteContainerActive: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#FF9F43",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  // Back arrow / search icon container inside the row
  leftButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 4,
    height: 44,
  },

  // Clear X container inside the row
  rightButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 12,
    paddingLeft: 4,
    height: 44,
    minWidth: 28, // Reserve space even when empty to prevent input width jumping
  },

  textInputContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },

  searchInput: {
    backgroundColor: "transparent",
    fontSize: 15,
    color: "#222",
    height: 44,
    paddingHorizontal: 4,
    elevation: 0,
    shadowOpacity: 0,
  },

  resultsList: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 4,
  },
});
