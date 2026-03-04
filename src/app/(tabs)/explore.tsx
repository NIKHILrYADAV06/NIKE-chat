import ExploreUserCard from "@/components/ExploreUserCard";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import { useAppContext } from "@/contexts/AppProvider";
import useStartChat from "@/hooks/useStartChat";
import useStreamUsers from "@/hooks/useStreamUsers";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { UserResponse } from "stream-chat";
import { useChatContext } from "stream-chat-expo";

/* ─────────────────────────────────────
   SKELETON ROW
───────────────────────────────────── */
function SkeletonCard({ delay = 0 }: { delay?: number }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const op = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.65],
  });

  return (
    <Animated.View
      style={{
        opacity: op,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: "#0F1117",
        borderRadius: 20,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#1A1F35",
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
            width: "45%",
          }}
        />
        <View
          style={{
            height: 10,
            borderRadius: 5,
            backgroundColor: "#161B2E",
            width: "30%",
          }}
        />
      </View>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: "#1E2740",
        }}
      />
    </Animated.View>
  );
}

/* ─────────────────────────────────────
   ONLINE COUNT BADGE
───────────────────────────────────── */
function OnlineBadge({ count }: { count: number }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  if (count === 0) return null;

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulse }],
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#16A34A18",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "#16A34A30",
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#4ADE80",
        }}
      />
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#4ADE80" }}>
        {count} online
      </Text>
    </Animated.View>
  );
}

/* ══════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════ */
const ExploreScreen = () => {
  const { setChannel } = useAppContext();
  const { user } = useUser();
  const { client } = useChatContext();
  const userId = user?.id ?? "";

  const [creating, setCreating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const { loading, users } = useStreamUsers(client, userId);
  const { handleStartChat } = useStartChat({
    client,
    userId,
    setChannel,
    setCreating,
  });

  const filteredUsers = !search.trim()
    ? users
    : users.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.id.toLowerCase().includes(search.toLowerCase()),
      );

  const onlineCount = users.filter((u) => u.online).length;

  /* ── entrance animations ── */
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-14)).current;
  const searchFade = useRef(new Animated.Value(0)).current;
  const searchScale = useRef(new Animated.Value(0.96)).current;
  const listFade = useRef(new Animated.Value(0)).current;

  /* search focus */
  const focusAnim = useRef(new Animated.Value(0)).current;

  /* ambient glow */
  const bgPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFade, {
          toValue: 1,
          duration: 360,
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
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(searchScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(listFade, {
        toValue: 1,
        duration: 300,
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
  }, []);

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const searchBorder = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1A1F35", "#6366F1"],
  });

  const renderUserItem = ({
    item,
    index,
  }: {
    item: UserResponse;
    index: number;
  }) => (
    <Animated.View
      style={{
        opacity: listFade,
        transform: [
          {
            translateY: listFade.interpolate({
              inputRange: [0, 1],
              outputRange: [10 + index * 4, 0],
            }),
          },
        ],
      }}
    >
      <ExploreUserCard
        item={item}
        creating={creating}
        onStartChat={handleStartChat}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#07090F" }}>
      {/* ── AMBIENT GLOWS ── */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: "#6366F1",
          opacity: bgPulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.04, 0.09],
          }),
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 80,
          left: -80,
          width: 220,
          height: 220,
          borderRadius: 110,
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
          paddingTop: 14,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#3F4558",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Discover
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#F1F5F9",
              letterSpacing: -0.7,
              marginTop: 2,
            }}
          >
            Explore
          </Text>
          <Text style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>
            Find people and start chatting
          </Text>
        </View>

        <OnlineBadge count={onlineCount} />
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
            placeholder="Search people..."
            placeholderTextColor="#2A2D3A"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
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
          )}
        </Animated.View>
      </Animated.View>

      {/* ── SECTION LABEL ── */}
      <Animated.View
        style={{
          opacity: listFade,
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
            <Ionicons name="people" size={14} color="#6366F1" />
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
            {search.trim() ? "Results" : "All People"}
          </Text>
        </View>

        {!loading && (
          <Text style={{ fontSize: 12, color: "#3F4558", fontWeight: "600" }}>
            {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "person" : "people"}
          </Text>
        )}
      </Animated.View>

      {/* ── LIST ── */}
      {loading ? (
        <View style={{ paddingHorizontal: 20 }}>
          {[0, 100, 200, 240, 320].map((d, i) => (
            <SkeletonCard key={i} delay={d} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<ListEmptyComponent />}
        />
      )}
    </SafeAreaView>
  );
};

export default ExploreScreen;
