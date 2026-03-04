import { COLORS } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import type { UserResponse } from "stream-chat";

type ExploreUserCardProps = {
  item: UserResponse;
  creating: string | null;
  onStartChat: (targetId: string) => void;
};

/* ── pulsing online dot ── */
function OnlineDot() {
  const ring = useRef(new Animated.Value(1)).current;
  const ringOp = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring, {
            toValue: 2.0,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(ring, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOp, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(ringOp, {
            toValue: 0.6,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: "#22C55E",
          opacity: ringOp,
          transform: [{ scale: ring }],
        }}
      />
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#22C55E",
          borderWidth: 2,
          borderColor: "#0F1117",
        }}
      />
    </View>
  );
}

/* ── chat bubble typing indicator (loading state) ── */
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -4,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.delay(400),
        ]),
      ).start();

    bounce(dot1, 0);
    bounce(dot2, 140);
    bounce(dot3, 280);
  }, []);

  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: `${COLORS.primary ?? "#6366F1"}15`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 3,
      }}
    >
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: COLORS.primary ?? "#6366F1",
            opacity: i === 1 ? 1 : 0.5,
            transform: [{ translateY: dot }],
          }}
        />
      ))}
    </View>
  );
}

/* ══════════════════════════════════════
   CARD
══════════════════════════════════════ */
const ExploreUserCard = ({
  item,
  creating,
  onStartChat,
}: ExploreUserCardProps) => {
  const isCreating = creating === item.id;
  const isDisabled = creating !== null;

  /* press scale */
  const pressScale = useRef(new Animated.Value(1)).current;
  const pressOp = useRef(new Animated.Value(1)).current;

  /* entrance */
  const entranceFade = useRef(new Animated.Value(0)).current;
  const entranceY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceFade, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.spring(entranceY, {
        toValue: 0,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true }),
      Animated.timing(pressOp, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(pressOp, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={{
        opacity: entranceFade,
        transform: [{ translateY: entranceY }, { scale: pressScale }],
        marginBottom: 10,
      }}
    >
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => onStartChat(item.id)}
        disabled={isDisabled}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          backgroundColor: "#0F1117",
          borderRadius: 20,
          padding: 14,
          borderWidth: 1,
          borderColor: isCreating
            ? `${COLORS.primary ?? "#6366F1"}40`
            : "#1A1F35",
          opacity: isDisabled && !isCreating ? 0.45 : 1,
        }}
      >
        {/* avatar */}
        <View style={{ position: "relative" }}>
          <View
            style={{
              borderRadius: 18,
              borderWidth: isCreating ? 2 : 1.5,
              borderColor: isCreating
                ? (COLORS.primary ?? "#6366F1")
                : item.online
                  ? "#22C55E40"
                  : "#1A1F35",
              padding: 2,
            }}
          >
            <Image
              source={item.image}
              style={{ width: 46, height: 46, borderRadius: 15 }}
              contentFit="cover"
            />
          </View>
          {item.online && <OnlineDot />}
        </View>

        {/* info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: "#F1F5F9",
              letterSpacing: -0.2,
            }}
            numberOfLines={1}
          >
            {item.name || item.id}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              marginTop: 3,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: item.online ? "#22C55E" : "#3F4558",
              }}
            />
            <Text
              style={{
                fontSize: 12,
                color: item.online ? "#4ADE80" : "#475569",
                fontWeight: "500",
              }}
            >
              {item.online ? "Online now" : "Offline"}
            </Text>
          </View>
        </View>

        {/* action */}
        {isCreating ? (
          <TypingIndicator />
        ) : (
          <Animated.View style={{ opacity: pressOp }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: `${COLORS.primary ?? "#6366F1"}15`,
                borderWidth: 1,
                borderColor: `${COLORS.primary ?? "#6366F1"}30`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="chatbubble"
                size={15}
                color={COLORS.primary ?? "#6366F1"}
              />
            </View>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default ExploreUserCard;
