import { COLORS } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const floatY = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    /* entrance */
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    /* float loop */
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -9,
          duration: 1900,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1900,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    /* glow pulse */
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1900,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const glowOp = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.22],
  });
  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#07090F",
        paddingHorizontal: 28,
        paddingBottom: 40,
        opacity: fade,
      }}
    >
      {/* icon + glow */}
      <Animated.View
        style={{
          transform: [{ translateY: floatY }, { scale }],
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        {/* ambient glow behind icon */}
        <Animated.View
          style={{
            position: "absolute",
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: COLORS.primary ?? "#6366F1",
            opacity: glowOp,
            transform: [{ scale: glowScale }],
          }}
        />

        {/* icon container */}
        <View
          style={{
            width: 78,
            height: 78,
            borderRadius: 26,
            backgroundColor: `${COLORS.primary ?? "#6366F1"}12`,
            borderWidth: 1.5,
            borderColor: `${COLORS.primary ?? "#6366F1"}28`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={34} color={COLORS.primary ?? "#6366F1"} />
        </View>
      </Animated.View>

      {/* text */}
      <Text
        style={{
          fontSize: 17,
          fontWeight: "700",
          color: "#E2E8F0",
          textAlign: "center",
          letterSpacing: -0.3,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          marginTop: 7,
          fontSize: 13,
          color: "#475569",
          textAlign: "center",
          lineHeight: 20,
          fontWeight: "400",
        }}
      >
        {subtitle}
      </Text>
    </Animated.View>
  );
}
