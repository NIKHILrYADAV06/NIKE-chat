import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    Switch,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

/* ─────────────────────────────────────
   MENU ITEMS
───────────────────────────────────── */
const MENU_ITEMS = [
  {
    icon: "settings-outline",
    label: "Settings",
    sublabel: "Preferences",
    color: "#94A3B8",
    bg: "#94A3B818",
  },
];

/* ─────────────────────────────────────
   DARK INK-BLEED RIPPLE
   Bursts from exact touch point,
   floods full screen, then fades out.
───────────────────────────────────── */
function DarkRipple({
  visible,
  origin,
  onDone,
}: {
  visible: boolean;
  origin: { x: number; y: number };
  onDone: () => void;
}) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0);
    opacity.setValue(1);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.93,
          duration: 260,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start(onDone);
  }, [visible]);

  if (!visible) return null;

  const maxDim = Math.sqrt(width * width + height * height) * 2.2;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: origin.y - maxDim / 2,
        left: origin.x - maxDim / 2,
        width: maxDim,
        height: maxDim,
        borderRadius: maxDim / 2,
        backgroundColor: "#000",
        opacity,
        transform: [{ scale }],
        zIndex: 999,
      }}
    />
  );
}

/* ─────────────────────────────────────
   SETTINGS BOTTOM SHEET
───────────────────────────────────── */
function SettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const slideY = useRef(new Animated.Value(700)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;

  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOp, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, {
          toValue: 700,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOp, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const TOGGLE_ROWS = [
    {
      icon: "notifications-outline",
      label: "Notifications",
      color: "#818CF8",
      value: notifications,
      setter: setNotifications,
    },
    {
      icon: "volume-medium-outline",
      label: "Sounds",
      color: "#34D399",
      value: sounds,
      setter: setSounds,
    },
  ];

  const LINK_ROWS = [
    { icon: "shield-checkmark-outline", label: "Privacy Policy" },
    { icon: "document-text-outline", label: "Terms of Service" },
    { icon: "help-circle-outline", label: "Help & Support" },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* backdrop */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.65)",
          opacity: backdropOp,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* sheet */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: slideY }],
          backgroundColor: "#0F1117",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderTopWidth: 1,
          borderColor: "#1E2130",
          paddingBottom: 44,
        }}
      >
        {/* drag handle */}
        <View
          style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}
        >
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#2A2D3A",
            }}
          />
        </View>

        {/* sheet header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 22,
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#F1F5F9",
              letterSpacing: -0.3,
            }}
          >
            Settings
          </Text>
          <Pressable
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: "#1A1D27",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={17} color="#64748B" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 460 }}
        >
          {/* toggles */}
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              color: "#3F4558",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              paddingHorizontal: 22,
              marginBottom: 10,
            }}
          >
            Preferences
          </Text>
          <View
            style={{
              marginHorizontal: 16,
              backgroundColor: "#131620",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#1E2130",
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            {TOGGLE_ROWS.map((row, i) => (
              <View key={i}>
                {i > 0 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#1A1D27",
                      marginHorizontal: 16,
                    }}
                  />
                )}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 11,
                      backgroundColor: `${row.color}18`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={row.icon as any}
                      size={19}
                      color={row.color}
                    />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: "500",
                      color: "#CBD5E1",
                    }}
                  >
                    {row.label}
                  </Text>
                  <Switch
                    value={row.value}
                    onValueChange={row.setter}
                    trackColor={{ false: "#1E2130", true: "#6366F1" }}
                    thumbColor={row.value ? "#fff" : "#4B5563"}
                    ios_backgroundColor="#1E2130"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* links */}
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              color: "#3F4558",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              paddingHorizontal: 22,
              marginBottom: 10,
            }}
          >
            About
          </Text>
          <View
            style={{
              marginHorizontal: 16,
              backgroundColor: "#131620",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#1E2130",
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            {LINK_ROWS.map((row, i) => (
              <View key={i}>
                {i > 0 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#1A1D27",
                      marginHorizontal: 16,
                    }}
                  />
                )}
                <Pressable
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 11,
                      backgroundColor: "#1A1D27",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={row.icon as any}
                      size={19}
                      color="#94A3B8"
                    />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: "500",
                      color: "#CBD5E1",
                    }}
                  >
                    {row.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={15} color="#3F4558" />
                </Pressable>
              </View>
            ))}
          </View>

          {/* version inside modal */}
          <View style={{ alignItems: "center", paddingVertical: 8 }}>
            <Text
              style={{
                fontSize: 11,
                color: "#2A2D3A",
                fontWeight: "600",
                letterSpacing: 1,
              }}
            >
              VERSION 1.0.0
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

/* ─────────────────────────────────────
   MENU ITEM ROW  (your original)
───────────────────────────────────── */
interface MenuItemProps {
  item: (typeof MENU_ITEMS)[0];
  index: number;
  parentAnim: Animated.Value;
  onPress?: () => void;
}

const MenuItem = ({ item, index, parentAnim, onPress }: MenuItemProps) => {
  const pressScale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ opacity: parentAnim, marginBottom: 8 }}>
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <Pressable
          onPressIn={() =>
            Animated.spring(pressScale, {
              toValue: 0.97,
              useNativeDriver: true,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(pressScale, {
              toValue: 1,
              useNativeDriver: true,
            }).start()
          }
          onPress={onPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: item.bg,
            borderRadius: 18,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: `${item.color}30`,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: `${item.color}20`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={item.icon as any} size={20} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#F1F5F9" }}>
              {item.label}
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
              {item.sublabel}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

/* ══════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════ */
const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ripple, setRipple] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
  });

  /* ── your original entrance animations ── */
  const masterAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const avatarScale = useRef(new Animated.Value(0.6)).current;
  const avatarOpacity = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;
  const signOutAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(masterAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(avatarScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(avatarOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(streakAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(signOutAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* ── your original sign-out press scale ── */
  const signOutScale = useRef(new Animated.Value(1)).current;
  const onSignOutIn = () =>
    Animated.spring(signOutScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  const onSignOutOut = () =>
    Animated.spring(signOutScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

  /* ── sign-out button border flash (new) ── */
  const signOutGlow = useRef(new Animated.Value(0)).current;
  const signOutBorder = signOutGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FF6B6B28", "#FF6B6B"],
  });
  const signOutBg = signOutGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FF6B6B12", "#2A0808"],
  });

  function handleSignOutPress(evt: any) {
    const { pageX, pageY } = evt.nativeEvent;
    /* border flash */
    signOutGlow.setValue(1);
    Animated.timing(signOutGlow, {
      toValue: 0,
      duration: 650,
      useNativeDriver: false,
    }).start();
    /* dark ink ripple from touch point */
    setRipple({ visible: true, x: pageX, y: pageY });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── HEADER (your original) ── */}
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 6,
            opacity: masterAnim,
            transform: [{ translateY: headerSlide }],
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 12,
                color: "#475569",
                fontWeight: "600",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Your Profile
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: "#F1F5F9",
                letterSpacing: -0.5,
              }}
            >
              Account
            </Text>
          </View>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              backgroundColor: "#161B2E",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#64748B" />
          </Pressable>
        </Animated.View>

        {/* ── HERO CARD (your original) ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <View
            style={{
              backgroundColor: "#161B2E",
              borderRadius: 28,
              padding: 24,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.07)",
              overflow: "hidden",
            }}
          >
            {/* decorative blobs */}
            <View
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 130,
                height: 130,
                borderRadius: 65,
                backgroundColor: "#6366F115",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -30,
                left: -20,
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#06B6D410",
              }}
            />

            {/* avatar + info */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <Animated.View
                style={{
                  opacity: avatarOpacity,
                  transform: [{ scale: avatarScale }],
                }}
              >
                <View
                  style={{
                    padding: 3,
                    borderRadius: 28,
                    borderWidth: 2,
                    borderColor: "#6366F1",
                  }}
                >
                  <Image
                    source={user?.imageUrl}
                    style={{ width: 74, height: 74, borderRadius: 22 }}
                    contentFit="cover"
                  />
                </View>
                {/* online dot */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: "#34D399",
                    borderWidth: 2.5,
                    borderColor: "#161B2E",
                  }}
                />
              </Animated.View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#F1F5F9",
                    letterSpacing: -0.3,
                  }}
                  numberOfLines={1}
                >
                  {user?.fullName || user?.username || "Student"}
                </Text>
                <Text
                  style={{ fontSize: 13, color: "#64748B", marginTop: 3 }}
                  numberOfLines={1}
                >
                  {user?.primaryEmailAddress?.emailAddress}
                </Text>
                {/* Pro Learner badge */}
                <View
                  style={{
                    marginTop: 10,
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    backgroundColor: "#6366F118",
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderWidth: 1,
                    borderColor: "#6366F130",
                  }}
                >
                  <Ionicons name="school-outline" size={13} color="#818CF8" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#818CF8",
                    }}
                  >
                    Pro Learner
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── MENU ITEMS (your original + opens settings) ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#475569",
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Quick Access
          </Text>
          {MENU_ITEMS.map((item, i) => (
            <MenuItem
              key={i}
              item={item}
              index={i}
              parentAnim={masterAnim}
              onPress={
                item.label === "Settings"
                  ? () => setSettingsOpen(true)
                  : undefined
              }
            />
          ))}
        </View>

        {/* ── SIGN OUT (your original + dark ripple) ── */}
        <Animated.View
          style={{
            paddingHorizontal: 20,
            marginTop: 8,
            opacity: signOutAnim,
            transform: [
              {
                translateY: signOutAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
              { scale: signOutScale },
            ],
          }}
        >
          <Animated.View
            style={{
              borderRadius: 18,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: signOutBorder,
            }}
          >
            <Pressable
              onPressIn={onSignOutIn}
              onPressOut={onSignOutOut}
              onPress={async (evt) => {
                handleSignOutPress(evt);
                await new Promise((r) => setTimeout(r, 700));
                try {
                  await signOut();
                  Sentry.logger.info("User signed out successfully", {
                    userId: user?.id,
                  });
                } catch (error) {
                  Sentry.logger.error("Error signing out", {
                    error,
                    userId: user?.id,
                  });
                  Sentry.captureException(error);
                  Alert.alert(
                    "Error",
                    "An error occurred while signing out. Please try again.",
                  );
                }
              }}
            >
              <Animated.View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  backgroundColor: signOutBg,
                  paddingVertical: 16,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: "#FF6B6B18",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#FF6B6B",
                    letterSpacing: 0.2,
                  }}
                >
                  Sign Out
                </Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* ── APP VERSION ── */}
        <Animated.View
          style={{ opacity: signOutAnim, alignItems: "center", marginTop: 20 }}
        >
          <Text
            style={{
              fontSize: 11,
              color: "#1E2740",
              fontWeight: "700",
              letterSpacing: 1.5,
            }}
          >
            VERSION 1.0.0
          </Text>
        </Animated.View>
      </ScrollView>

      {/* ── DARK INK RIPPLE — above everything ── */}
      <DarkRipple
        visible={ripple.visible}
        origin={{ x: ripple.x, y: ripple.y }}
        onDone={() => setRipple((r) => ({ ...r, visible: false }))}
      />

      {/* ── SETTINGS MODAL ── */}
      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
