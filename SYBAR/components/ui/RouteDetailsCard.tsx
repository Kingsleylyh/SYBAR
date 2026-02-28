import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteLeg, RouteResponse } from "@/types/routes";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MIN_HEIGHT = 80; // Visible portion above the nav bar
const MAX_HEIGHT = SCREEN_HEIGHT * 0.55;
// const MIN_HEIGHT = 100; // Small portion visible above Nav Bar
// const MAX_HEIGHT = SCREEN_HEIGHT * 0.5;

// Helper: strip HTML tags Google sometimes injects into instructions
const stripHtml = (text?: string): string =>
  text ? text.replace(/<[^>]*>?/gm, "") : "";

// Helper: convert "123s" duration string to "X mins" display string
const formatDuration = (duration?: string): string => {
  if (!duration) return "";
  const secs = parseInt(duration.replace("s", ""), 10);
  return `${Math.ceil(secs / 60)} mins`;
};

// Helper: convert metres to readable distance
const formatDistance = (metres?: number): string => {
  if (!metres) return "";
  return metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${metres} m`;
};

export const RouteDetailsCard = ({ data }: { data: RouteResponse | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedLegIndex, setExpandedLegIndex] = useState<number | null>(null);
  const translateY = useSharedValue(0);

  const toggleSheet = () => {
    translateY.value = isOpen ? 0 : -(MAX_HEIGHT - MIN_HEIGHT);
    setIsOpen(!isOpen);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(translateY.value, {
          damping: 15,
          stiffness: 100,
        }),
      },
    ],
  }));

  if (!data) return null;

  const trafficDelay = data.staticDurationMins
    ? data.durationMins - data.staticDurationMins
    : 0;

  // Label each leg: "To Stop 1", "To Stop 2", ..., "To Destination"
  const getLegLabel = (index: number): string =>
    index === data.legs.length - 1 ? "To Destination" : `To Stop ${index + 1}`;

  return (
    <Animated.View style={[styles.sheet, animatedStyle]}>
      {/* Trigger Button (Arrow) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleSheet}
        style={styles.arrowButton}
      >
        <MaterialIcons
          name={isOpen ? "keyboard-arrow-down" : "keyboard-arrow-up"}
          size={30}
          color="white"
        />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Summary Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.totalDuration}>{data.durationMins} mins</Text>
            <Text style={styles.totalDistance}>
              {data.distanceKm.toFixed(1)} km
            </Text>
          </View>
          {data.staticDurationMins && (
            <Text style={styles.staticDuration}>
              Without traffic: {data.staticDurationMins} mins
            </Text>
          )}
          {trafficDelay > 0 && (
            <View style={styles.trafficBadge}>
              <Text style={styles.trafficText}>+{trafficDelay}m traffic</Text>
            </View>
          )}
        </View>

        {/* Legs */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.legsContainer}
        >
          {data.legs.map((leg: RouteLeg, index: number) => (
            <View key={index} style={styles.legWrapper}>
              <TouchableOpacity
                style={styles.legHeader}
                onPress={() =>
                  setExpandedLegIndex(expandedLegIndex === index ? null : index)
                }
              >
                <View style={styles.legTitleBlock}>
                  <Text style={styles.legTitle}>{getLegLabel(index)}</Text>
                  <Text style={styles.legMeta}>
                    {formatDuration(leg.duration)}
                    {leg.distanceMeters
                      ? `  ·  ${formatDistance(leg.distanceMeters)}`
                      : ""}
                  </Text>
                </View>
                <MaterialIcons
                  name={
                    expandedLegIndex === index ? "expand-less" : "expand-more"
                  }
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>

              {expandedLegIndex === index && (
                <View style={styles.legDetailBody}>
                  {leg.steps?.length > 0 ? (
                    leg.steps.map((step, sIdx) => (
                      <View key={sIdx} style={styles.stepRow}>
                        <MaterialIcons
                          name="arrow-forward"
                          size={14}
                          color="#FF9F43"
                          style={styles.stepIcon}
                        />
                        <View style={styles.stepTextBlock}>
                          <Text style={styles.stepText}>
                            {stripHtml(
                              step.navigationInstruction?.instructions,
                            ) || "Continue"}
                          </Text>
                          {step.distanceMeters ? (
                            <Text style={styles.stepDistance}>
                              {formatDistance(step.distanceMeters)}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noStepsText}>
                      No step details available.
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: -MAX_HEIGHT + MIN_HEIGHT + 60, // Sits behind the nav bar (adjust 60 based on your nav height)
    left: 0,
    right: 0,
    height: MAX_HEIGHT,
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 5,
  },
  arrowButton: {
    position: "absolute",
    top: -25,
    alignSelf: "center",
    backgroundColor: "#FF9F43",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  content: {
    padding: 20,
    paddingTop: 35,
    height: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  totalDuration: { fontSize: 24, fontWeight: "bold", color: "#333" },
  totalDistance: { fontSize: 16, color: "#666" },
  staticDuration: { fontSize: 12, color: "#999" },
  trafficBadge: { backgroundColor: "#FFE5E5", padding: 5, borderRadius: 5 },
  trafficText: { color: "#FF4D4D", fontWeight: "bold" },
  legsContainer: { marginTop: 10 },
  legWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingVertical: 10,
  },
  legHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legTitleBlock: { flex: 1 },
  legTitle: { fontWeight: "600", color: "#444", fontSize: 15 },
  legMeta: { fontSize: 12, color: "#999", marginTop: 2 },
  legDetailBody: {
    padding: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    marginTop: 5,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  stepIcon: { marginTop: 2, marginRight: 6 },
  stepTextBlock: { flex: 1 },
  stepText: { fontSize: 13, color: "#555" },
  stepDistance: { fontSize: 11, color: "#999", marginTop: 1 },
  noStepsText: { fontSize: 13, color: "#999", fontStyle: "italic" },
});
