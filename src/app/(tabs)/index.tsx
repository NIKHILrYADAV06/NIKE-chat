import { useAppContext } from "@/contexts/AppProvider";
import { getGreetingForHour } from "@/lib/utils";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Channel } from "stream-chat";
import { ChannelList } from "stream-chat-expo";

/* ─────────────────────────────────────
   PULSING DOT
───────────────────────────────────── */
function PulseDot({
  color = "#22C55E",
  size = 6,
}: {
  color?: string;
  size?: number;
}) {
  const ring = useRef(new Animated.Value(1)).current;
  const ringOp = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring, {
            toValue: 2.2,
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
        width: size * 3,
        height: size * 3,
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
          backgroundColor: color,
          opacity: ringOp,
          transform: [{ scale: ring }],
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/* ─────────────────────────────────────
   SHIMMER SKELETON
───────────────────────────────────── */
function SkeletonRow({ delay = 0 }: { delay?: number }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const op = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={{
        opacity: op,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 14,
      }}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 18,
          backgroundColor: "#1E2740",
        }}
      />
      <View style={{ flex: 1, gap: 8 }}>
        <View
          style={{
            height: 13,
            borderRadius: 6,
            backgroundColor: "#1E2740",
            width: "55%",
          }}
        />
        <View
          style={{
            height: 10,
            borderRadius: 5,
            backgroundColor: "#161B2E",
            width: "80%",
          }}
        />
      </View>
      <View
        style={{
          width: 32,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#1E2740",
        }}
      />
    </Animated.View>
  );
}

/* ─────────────────────────────────────
   EMPTY STATE
───────────────────────────────────── */
function EmptyState({ search }: { search: string }) {
  const floatY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -8,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        opacity: fade,
        paddingBottom: 60,
      }}
    >
      <Animated.View
        style={{
          transform: [{ translateY: floatY }, { scale }],
          marginBottom: 20,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 28,
            backgroundColor: "#6366F112",
            borderWidth: 1.5,
            borderColor: "#6366F130",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={search ? "search-outline" : "chatbubbles-outline"}
            size={34}
            color="#6366F1"
          />
        </View>
      </Animated.View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: "#F1F5F9",
          letterSpacing: -0.3,
        }}
      >
        {search ? "No results found" : "No study rooms yet"}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: "#475569",
          marginTop: 6,
          textAlign: "center",
          paddingHorizontal: 40,
          lineHeight: 20,
        }}
      >
        {search
          ? `No rooms match "${search}". Try a different term.`
          : "Join or create a study room to start collaborating."}
      </Text>
    </Animated.View>
  );
}

/* ══════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════ */
const ChatsScreen = () => {
  const { setChannel } = useAppContext();
  const { user } = useUser();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const firstName = user?.firstName || "there";

  /* entrance */
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-16)).current;
  const searchFade = useRef(new Animated.Value(0)).current;
  const searchScale = useRef(new Animated.Value(0.96)).current;
  const sectionFade = useRef(new Animated.Value(0)).current;
  const listFade = useRef(new Animated.Value(0)).current;

  /* search focus */
  const focusAnim = useRef(new Animated.Value(0)).current;

  /* ambient bg */
  const bgPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFade, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.spring(headerY, {
          toValue: 0,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(searchFade, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(searchScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(sectionFade, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(listFade, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bgPulse, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(bgPulse, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const searchBorder = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1A1F35", "#6366F1"],
  });

  const filters = { members: { $in: [user?.id!] }, type: "messaging" };

  const channelRenderFilterFn = (channels: Channel[]) => {
    if (!search.trim()) return channels;
    const q = search.toLowerCase();
    return channels.filter((ch) => {
      const name = (ch.data?.name as string | undefined)?.toLowerCase() ?? "";
      return name.includes(q) || ch.cid.toLowerCase().includes(q);
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#07090F" }}>
      {/* ── AMBIENT GLOWS ── */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -80,
          left: -60,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "#6366F1",
          opacity: bgPulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.04, 0.08],
          }),
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 100,
          right: -80,
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: "#06B6D4",
          opacity: bgPulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.03, 0.06],
          }),
        }}
      />

      {/* ── HEADER ── */}
      <Animated.View
        style={{
          opacity: headerFade,
          transform: [{ translateY: headerY }],
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <PulseDot color="#22C55E" size={6} />
            <Text
              style={{
                fontSize: 12,
                color: "#475569",
                fontWeight: "600",
                letterSpacing: 0.4,
              }}
            >
              {getGreetingForHour()}, {firstName}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#F1F5F9",
              letterSpacing: -0.8,
              marginTop: 2,
            }}
          >
            Study Rooms
          </Text>
        </View>

        {/* avatar chip */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: "#6366F118",
            borderWidth: 1.5,
            borderColor: "#6366F140",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#818CF8" }}>
            {(user?.firstName?.[0] ?? "?").toUpperCase()}
          </Text>
        </View>
      </Animated.View>

      {/* ── SEARCH BAR ── */}
      <Animated.View
        style={{
          opacity: searchFade,
          transform: [{ scale: searchScale }],
          marginHorizontal: 20,
          marginTop: 10,
          marginBottom: 14,
        }}
      >
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: "#0F1117",
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1.5,
            borderColor: searchBorder,
          }}
        >
          <Ionicons
            name="search"
            size={17}
            color={isFocused ? "#818CF8" : "#3F4558"}
          />
          <TextInput
            style={{
              flex: 1,
              fontSize: 15,
              color: "#F1F5F9",
              paddingVertical: 0,
            }}
            placeholder="Search rooms, topics..."
            placeholderTextColor="#2A2D3A"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {search.length > 0 ? (
            <Pressable
              onPress={() => setSearch("")}
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#1E2130",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={13} color="#64748B" />
            </Pressable>
          ) : (
            <View
              style={{
                backgroundColor: "#1A1F35",
                borderRadius: 7,
                paddingHorizontal: 6,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{ fontSize: 10, color: "#3F4558", fontWeight: "700" }}
              >
                ⌘K
              </Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>

      {/* ── SECTION HEADER ── */}
      <Animated.View
        style={{
          opacity: sectionFade,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              backgroundColor: "#6366F115",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chatbubbles" size={14} color="#6366F1" />
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#3F4558",
              letterSpacing: 1.4,
              textTransform: "uppercase",
            }}
          >
            {search.trim() ? "Search Results" : "Your Sessions"}
          </Text>
        </View>

        {/* sort button */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: "#0F1117",
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: "#1A1F35",
          }}
        >
          <Ionicons name="swap-vertical" size={13} color="#475569" />
          <Text style={{ fontSize: 12, color: "#475569", fontWeight: "600" }}>
            Recent
          </Text>
        </Pressable>
      </Animated.View>

      {/* ── CHANNEL LIST ── */}
      <Animated.View style={{ flex: 1, opacity: listFade }}>
        {isLoading ? (
          <View>
            {[0, 80, 160, 240, 320].map((d, i) => (
              <SkeletonRow key={i} delay={d} />
            ))}
          </View>
        ) : (
          <ChannelList
            filters={filters}
            options={{ state: true, watch: true }}
            sort={{ last_updated: -1 }}
            channelRenderFilterFn={channelRenderFilterFn}
            onSelect={(channel) => {
              setChannel(channel);
              router.push(`/channel/${channel.id}` as any);
            }}
            EmptyStateIndicator={() => <EmptyState search={search} />}
            additionalFlatListProps={{
              contentContainerStyle: { flexGrow: 1 },
              style: { backgroundColor: "transparent" },
              showsVerticalScrollIndicator: false,
            }}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

export default ChatsScreen;
