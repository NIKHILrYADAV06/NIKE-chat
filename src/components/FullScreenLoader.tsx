import { COLORS } from "@/lib/theme";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function FullScreenLoader({ message }: { message: string }) {
  /* three typing dots */
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  /* bubble entrance */
  const bubbleScale = useRef(new Animated.Value(0.7)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;

  /* message fade */
  const msgFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    /* bubble pop in */
    Animated.parallel([
      Animated.spring(bubbleScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(bubbleOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    /* typing dots — bounce up and back, staggered */
    const bounceDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -7,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.delay(500),
        ]),
      ).start();

    bounceDot(dot1, 0);
    bounceDot(dot2, 160);
    bounceDot(dot3, 320);

    /* message */
    Animated.timing(msgFade, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#07090F" }}>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {/* chat bubble */}
        <Animated.View
          style={{
            opacity: bubbleOpacity,
            transform: [{ scale: bubbleScale }],
          }}
        >
          <View
            style={{
              backgroundColor: "#161B2E",
              borderRadius: 22,
              borderBottomLeftRadius: 6,
              paddingHorizontal: 22,
              paddingVertical: 16,
              borderWidth: 1,
              borderColor: "#1E2740",
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              minWidth: 88,
              justifyContent: "center",
              shadowColor: "#6366F1",
              shadowOpacity: 0.12,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            {[dot1, dot2, dot3].map((dot, i) => (
              <Animated.View
                key={i}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 4.5,
                  backgroundColor:
                    i === 1
                      ? (COLORS.primary ?? "#6366F1")
                      : `${COLORS.primary ?? "#6366F1"}70`,
                  transform: [{ translateY: dot }],
                }}
              />
            ))}
          </View>

          {/* bubble tail */}
          <View
            style={{
              position: "absolute",
              bottom: -1,
              left: 16,
              width: 0,
              height: 0,
              borderRightWidth: 10,
              borderTopWidth: 10,
              borderRightColor: "transparent",
              borderTopColor: "#161B2E",
            }}
          />
        </Animated.View>

        {/* message */}
        <Animated.Text
          style={{
            opacity: msgFade,
            fontSize: 13,
            fontWeight: "500",
            color: "#3F4558",
            letterSpacing: 0.3,
          }}
        >
          {message}
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}
