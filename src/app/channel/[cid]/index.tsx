import { EmptyState } from "@/components/EmptyState";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { useAppContext } from "@/contexts/AppProvider";
import { COLORS } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {
    Channel,
    MessageInput,
    MessageList,
    useChatContext,
} from "stream-chat-expo";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ─────────────────────────────────────
   PULSING ONLINE DOT
───────────────────────────────────── */
function OnlineDot({ size = 7 }: { size?: number }) {
  const ring = useRef(new Animated.Value(1)).current;
  const ringOp = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring, {
            toValue: 2.4,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(ring, {
            toValue: 1,
            duration: 1100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOp, {
            toValue: 0,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(ringOp, {
            toValue: 0.55,
            duration: 1100,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <View
      style={{
        width: size * 2.4,
        height: size * 2.4,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: size * 2,
          height: size * 2,
          borderRadius: size,
          backgroundColor: "#22C55E",
          opacity: ringOp,
          transform: [{ scale: ring }],
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#22C55E",
          borderWidth: 1.5,
          borderColor: "#0A0C14",
        }}
      />
    </View>
  );
}

/* ─────────────────────────────────────
   TYPING INDICATOR  (3-dot bubble)
───────────────────────────────────── */
function TypingBubble({ name }: { name: string }) {
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const d3 = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(-14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.spring(slideX, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const bounce = (d: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(d, {
            toValue: -5,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(d, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.delay(500),
        ]),
      ).start();

    bounce(d1, 0);
    bounce(d2, 140);
    bounce(d3, 280);
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fade,
        transform: [{ translateX: slideX }],
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingBottom: 6,
      }}
    >
      {/* bubble */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          backgroundColor: "#13172A",
          borderRadius: 16,
          borderBottomLeftRadius: 5,
          paddingHorizontal: 12,
          paddingVertical: 9,
          borderWidth: 1,
          borderColor: "#1E2338",
        }}
      >
        {[d1, d2, d3].map((d, i) => (
          <Animated.View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: COLORS.primary ?? "#6366F1",
              opacity: i === 1 ? 1 : 0.5,
              transform: [{ translateY: d }],
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: 11, color: "#3F4558", fontStyle: "italic" }}>
        {name} is typing…
      </Text>
    </Animated.View>
  );
}

/* ─────────────────────────────────────
   AMBIENT PARTICLE  (floating orb)
───────────────────────────────────── */
function AmbientOrb({
  x,
  y,
  size,
  color,
  duration,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.07,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.1,
            duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.02,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.6,
            duration,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

/* ─────────────────────────────────────
   HEADER TITLE
───────────────────────────────────── */
function HeaderTitle({
  displayName,
  avatarUrl,
  isOnline,
}: {
  displayName: string;
  avatarUrl: string;
  isOnline: boolean;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    if (!displayName) return;
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.spring(slideX, {
        toValue: 0,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [displayName]);

  return (
    <Animated.View
      style={{
        flexDirection: "row",
        alignItems: "center",
        opacity: fade,
        transform: [{ translateX: slideX }],
      }}
    >
      {/* avatar ring */}
      <View style={{ position: "relative", marginRight: 10 }}>
        <View
          style={{
            borderRadius: 15,
            borderWidth: 2,
            borderColor: isOnline ? "#22C55E" : "#1E2338",
            padding: 2,
          }}
        >
          {avatarUrl ? (
            <Image
              source={avatarUrl}
              style={{ width: 30, height: 30, borderRadius: 11 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 11,
                backgroundColor: `${COLORS.primary ?? "#6366F1"}25`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: COLORS.primary ?? "#818CF8",
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        {isOnline && (
          <View style={{ position: "absolute", bottom: -1, right: -1 }}>
            <OnlineDot size={5} />
          </View>
        )}
      </View>

      <View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: "#F1F5F9",
            letterSpacing: -0.2,
          }}
        >
          {displayName}
        </Text>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "500",
            color: isOnline ? "#4ADE80" : "#3F4558",
            marginTop: 1,
          }}
        >
          {isOnline ? "● Active now" : "● Offline"}
        </Text>
      </View>
    </Animated.View>
  );
}

/* ─────────────────────────────────────
   SCROLL TO BOTTOM FAB
───────────────────────────────────── */
function ScrollFab({
  visible,
  onPress,
}: {
  visible: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: visible ? 1 : 0,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(op, {
        toValue: visible ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 90,
        right: 18,
        opacity: op,
        transform: [{ scale }],
        zIndex: 10,
      }}
    >
      <Pressable
        onPress={onPress}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#13172A",
          borderWidth: 1.5,
          borderColor: `${COLORS.primary ?? "#6366F1"}40`,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: COLORS.primary ?? "#6366F1",
          shadowOpacity: 0.3,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        <Ionicons
          name="chevron-down"
          size={18}
          color={COLORS.primary ?? "#818CF8"}
        />
      </Pressable>
    </Animated.View>
  );
}

/* ══════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════ */
const ChannelScreen = () => {
  const { channel, setThread } = useAppContext();
  const { client } = useChatContext();
  const router = useRouter();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();

  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState("");
  const [showScrollFab, setShowScrollFab] = useState(false);

  /* resolve peer */
  let displayName = "";
  let avatarUrl = "";
  let isOnline = false;

  if (channel) {
    const members = Object.values(channel.state.members);
    const otherMember = members.find((m) => m.user_id !== client.userID);
    displayName = otherMember?.user?.name ?? "";
    avatarUrl = (otherMember?.user?.image as string) || "";
    isOnline = otherMember?.user?.online ?? false;
  }

  /* listen to typing events */
  useEffect(() => {
    if (!channel) return;
    const unsub1 = channel.on("typing.start", (e: any) => {
      if (e.user?.id !== client.userID) {
        setTypingName(e.user?.name ?? "Someone");
        setIsTyping(true);
      }
    });
    const unsub2 = channel.on("typing.stop", (e: any) => {
      if (e.user?.id !== client.userID) setIsTyping(false);
    });
    return () => {
      unsub1.unsubscribe();
      unsub2.unsubscribe();
    };
  }, [channel]);

  /* input bar entrance */
  const inputBarY = useRef(new Animated.Value(50)).current;
  const inputBarFade = useRef(new Animated.Value(0)).current;
  const inputBarScale = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(inputBarY, {
        toValue: 0,
        friction: 9,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(inputBarFade, {
        toValue: 1,
        duration: 360,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.spring(inputBarScale, {
        toValue: 1,
        friction: 8,
        delay: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* header */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: "#0A0C14",
        borderBottomWidth: 1,
        borderBottomColor: "#13172A",
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: COLORS.text,

      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginLeft: 10,
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: "#13172A",
            borderWidth: 1,
            borderColor: "#1E2338",
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={20} color="#64748B" />
        </TouchableOpacity>
      ),

      headerTitle: () => (
        <HeaderTitle
          displayName={displayName}
          avatarUrl={avatarUrl}
          isOnline={isOnline}
        />
      ),

      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 8, marginRight: 12 }}>
          {/* video */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              // router.push({ pathname: "/call/[callId]", params: { callId: channel?.id! } });
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: `${COLORS.primary ?? "#6366F1"}15`,
              borderWidth: 1,
              borderColor: `${COLORS.primary ?? "#6366F1"}28`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="videocam-outline"
              size={18}
              color={COLORS.primary ?? "#818CF8"}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [
    navigation,
    displayName,
    avatarUrl,
    isOnline,
    channel?.cid,
    channel?.id,
    router,
  ]);

  if (!channel) return <FullScreenLoader message="Loading study room..." />;

  return (
    <View style={{ flex: 1, backgroundColor: "#07090F" }}>
      {/* ── AMBIENT ORBS ── */}
      <AmbientOrb x={-60} y={100} size={300} color="#6366F1" duration={5000} />
      <AmbientOrb
        x={SCREEN_WIDTH - 100}
        y={300}
        size={240}
        color="#06B6D4"
        duration={6500}
      />
      <AmbientOrb
        x={SCREEN_WIDTH / 2 - 80}
        y={SCREEN_WIDTH}
        size={200}
        color="#A78BFA"
        duration={4500}
      />

      {/* ── SCROLL FAB ── */}
      <ScrollFab
        visible={showScrollFab}
        onPress={() => setShowScrollFab(false)}
      />

      <Channel
        channel={channel}
        keyboardVerticalOffset={headerHeight}
        EmptyStateIndicator={() => (
          <EmptyState
            icon="book-outline"
            title="No messages yet"
            subtitle="Start a study conversation!"
          />
        )}
      >
        <MessageList
          onThreadSelect={(thread) => {
            setThread(thread);
            router.push(`/channel/${channel.cid}/thread/${thread?.cid}`);
          }}
        />

        {/* ── TYPING INDICATOR ── */}
        {isTyping && <TypingBubble name={typingName} />}

        {/* ── INPUT BAR ── */}
        <Animated.View
          style={{
            opacity: inputBarFade,
            transform: [{ translateY: inputBarY }, { scale: inputBarScale }],
            backgroundColor: "#0A0C14",
            borderTopWidth: 1,
            borderTopColor: "#13172A",
            paddingBottom: 22,
            paddingHorizontal: 8,
            paddingTop: 6,
          }}
        >
          <MessageInput audioRecordingEnabled />
        </Animated.View>
      </Channel>
    </View>
  );
};

export default ChannelScreen;
