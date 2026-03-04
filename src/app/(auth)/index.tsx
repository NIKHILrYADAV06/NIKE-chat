import useSocialAuth from "@/hooks/useSocialAuth";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AuthScreen = () => {
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();
  const isLoading = loadingStrategy !== null;

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
        {/* ================= TOP SECTION ================= */}
        <View>
          {/* 🔥 Logo + Title */}
          <Animated.View
            entering={FadeInDown.duration(800)}
            style={{ alignItems: "center", paddingTop: 70 }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "rgba(162,155,254,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chatbubble" size={28} color="#A29BFE" />
            </View>

            {/* App Name */}
            <Text
              style={{
                fontSize: 38,
                fontWeight: "900",
                marginTop: 22,
                color: "white",
                letterSpacing: 2,
              }}
            >
              NIK CHAT
            </Text>

            {/* 🔥 Gen-Z Tagline */}
            <Text
              style={{
                fontSize: 16,
                color: "#A29BFE",
                marginTop: 14,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              Talk Smart. Move Fast.
            </Text>

            {/* Sub Text */}
            <Text
              style={{
                fontSize: 14,
                color: "#8E8E93",
                marginTop: 8,
                textAlign: "center",
                paddingHorizontal: 40,
                lineHeight: 20,
              }}
            >
              Real-time vibes. Zero noise. Built for the next-gen conversations.
            </Text>
          </Animated.View>

          {/* 🖼 Hero Image */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(800)}
            style={{
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <Image
              source={require("@/assets/images/auth.jpeg")}
              style={{
                width: 320,
                height: 320,
                borderRadius: 30,
              }}
              contentFit="cover"
            />
          </Animated.View>
        </View>

        {/* ================= BOTTOM SECTION ================= */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(800)}
          style={{ paddingHorizontal: 30, paddingBottom: 40 }}
        >
          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "white",
              }}
            />
            <Text
              style={{
                color: "white",
                fontSize: 12,
                marginHorizontal: 10,
                letterSpacing: 2,
                fontWeight: "600",
              }}
            >
              CONTINUE WITH
            </Text>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "white",
              }}
            />
          </View>

          {/* Social Buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 25,
            }}
          >
            {/* GOOGLE */}
            <Pressable
              style={({ pressed }) => ({
                width: 85,
                height: 85,
                borderRadius: 42.5,
                backgroundColor: "rgba(255,255,255,0.05)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
              disabled={isLoading}
              onPress={() => !isLoading && handleSocialAuth("oauth_google")}
            >
              {loadingStrategy === "oauth_google" ? (
                <ActivityIndicator size="small" color="#A29BFE" />
              ) : (
                <Image
                  source={require("../../../assets/images/google.png")}
                  style={{ width: 30, height: 30 }}
                  contentFit="contain"
                />
              )}
            </Pressable>

            {/* APPLE */}
            <Pressable
              style={({ pressed }) => ({
                width: 85,
                height: 85,
                borderRadius: 42.5,
                backgroundColor: "rgba(255,255,255,0.05)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
              disabled={isLoading}
              onPress={() => !isLoading && handleSocialAuth("oauth_apple")}
            >
              {loadingStrategy === "oauth_apple" ? (
                <ActivityIndicator size="small" color="#A29BFE" />
              ) : (
                <Ionicons name="logo-apple" size={34} color="white" />
              )}
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default AuthScreen;
