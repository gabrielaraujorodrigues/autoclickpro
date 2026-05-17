import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

const { width: SW, height: SH } = Dimensions.get("window");
const BUBBLE_SIZE = 62;
const EXPANDED_W = 220;

const STEP_ICONS: Record<string, string> = {
  tap_gift: "gift",
  watch_ad: "play-circle",
  skip_ad: "skip-forward",
  close_x: "x-circle",
  wait: "clock",
  tap_custom: "crosshair",
};

const STEP_COLORS: Record<string, string> = {
  tap_gift: "#00ff88",
  watch_ad: "#00ccff",
  skip_ad: "#ffaa00",
  close_x: "#ff4444",
  wait: "#888888",
  tap_custom: "#cc88ff",
};

interface Props {
  visible: boolean;
  stepType: string;
  stepLabel: string;
  countdown: number;
  progress: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function FloatingBubble({
  visible,
  stepType,
  stepLabel,
  countdown,
  progress,
  isPaused,
  onPause,
  onResume,
  onStop,
}: Props) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const pan = useRef(new Animated.ValueXY({ x: SW - BUBBLE_SIZE - 16, y: SH * 0.4 })).current;
  const scale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const accentColor = STEP_COLORS[stepType] ?? colors.primary;
  const iconName = STEP_ICONS[stepType] ?? "loader";

  // Show/hide animation
  useEffect(() => {
    Animated.spring(scale, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 7,
    }).start();
  }, [visible, scale]);

  // Pulse glow
  useEffect(() => {
    if (!visible || isPaused) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, isPaused, glowAnim]);

  // Step change pulse
  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.2, duration: 120, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }, [stepType, pulseAnim]);

  // Expand animation
  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: false,
      tension: 120,
      friction: 8,
    }).start();
  }, [expanded, expandAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        const x = (pan.x as any)._value;
        const y = (pan.y as any)._value;
        // Snap to nearest edge
        const snapX = x + BUBBLE_SIZE / 2 < SW / 2 ? 16 : SW - BUBBLE_SIZE - 16;
        const clampedY = Math.max(80, Math.min(y, SH - BUBBLE_SIZE - 80));
        Animated.spring(pan, {
          toValue: { x: snapX, y: clampedY },
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
        // If barely moved, treat as tap
        if (Math.abs(g.dx) < 5 && Math.abs(g.dy) < 5) {
          setExpanded((p) => !p);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
    })
  ).current;

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });
  const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const expandedWidth = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [BUBBLE_SIZE, EXPANDED_W] });
  const expandedOpacity = expandAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

  // Arc progress
  const arcProgress = Math.round(progress * 100);

  const s = StyleSheet.create({
    wrapper: {
      position: "absolute",
      zIndex: 9999,
    },
    glowRing: {
      position: "absolute",
      width: BUBBLE_SIZE,
      height: BUBBLE_SIZE,
      borderRadius: BUBBLE_SIZE / 2,
      backgroundColor: accentColor,
    },
    bubble: {
      height: BUBBLE_SIZE,
      borderRadius: BUBBLE_SIZE / 2,
      backgroundColor: "#111111",
      borderWidth: 2,
      borderColor: accentColor,
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      elevation: 16,
    },
    bubbleLeft: {
      width: BUBBLE_SIZE - 4,
      height: BUBBLE_SIZE - 4,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    progressRing: {
      position: "absolute",
      width: BUBBLE_SIZE - 4,
      height: BUBBLE_SIZE - 4,
      borderRadius: (BUBBLE_SIZE - 4) / 2,
      borderWidth: 2.5,
      borderColor: accentColor + "44",
    },
    progressFill: {
      position: "absolute",
      top: 2,
      left: 2,
      width: BUBBLE_SIZE - 8,
      height: BUBBLE_SIZE - 8,
      borderRadius: (BUBBLE_SIZE - 8) / 2,
      borderWidth: 2.5,
      borderColor: accentColor,
      borderTopColor: "transparent",
      borderRightColor: "transparent",
    },
    countdownBadge: {
      position: "absolute",
      bottom: -2,
      right: -2,
      backgroundColor: accentColor,
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 1,
      minWidth: 20,
      alignItems: "center",
    },
    countdownText: { fontSize: 9, fontWeight: "800", color: "#000" },
    expandedContent: {
      flex: 1,
      paddingRight: 12,
      paddingLeft: 4,
    },
    stepName: {
      fontSize: 11,
      fontWeight: "700",
      color: "#ffffff",
      numberOfLines: 1,
    },
    progressBar: {
      height: 3,
      backgroundColor: "#333",
      borderRadius: 2,
      marginTop: 4,
      overflow: "hidden",
    },
    progressBarFill: {
      height: 3,
      borderRadius: 2,
      backgroundColor: accentColor,
    },
    btnRow: {
      flexDirection: "row",
      gap: 6,
      marginTop: 6,
    },
    actionBtn: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    pausedBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.warning,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        s.wrapper,
        {
          transform: [{ scale }],
          left: pan.x,
          top: pan.y,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Glow ring */}
      {!isPaused && (
        <Animated.View
          style={[
            s.glowRing,
            { opacity: glowOpacity, transform: [{ scale: glowScale }] },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Main bubble */}
      <Animated.View style={[s.bubble, { width: expandedWidth }]}>
        {/* Icon + progress ring */}
        <Animated.View style={[s.bubbleLeft, { transform: [{ scale: pulseAnim }] }]}>
          <View style={s.progressRing} />
          <Feather name={iconName as any} size={22} color={accentColor} />
          {countdown > 0 && (
            <View style={s.countdownBadge}>
              <Text style={s.countdownText}>{countdown}s</Text>
            </View>
          )}
          {isPaused && (
            <View style={s.pausedBadge}>
              <Feather name="pause" size={8} color="#000" />
            </View>
          )}
        </Animated.View>

        {/* Expanded content */}
        <Animated.View style={[s.expandedContent, { opacity: expandedOpacity }]}>
          <Text style={s.stepName} numberOfLines={1}>{stepLabel}</Text>
          <View style={s.progressBar}>
            <View style={[s.progressBarFill, { width: `${arcProgress}%` }]} />
          </View>
          <View style={s.btnRow}>
            <Pressable
              style={[s.actionBtn, { backgroundColor: accentColor + "22" }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                isPaused ? onResume() : onPause();
              }}
            >
              <Feather name={isPaused ? "play" : "pause"} size={13} color={accentColor} />
            </Pressable>
            <Pressable
              style={[s.actionBtn, { backgroundColor: "#ff444422" }]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                onStop();
              }}
            >
              <Feather name="square" size={13} color="#ff4444" />
            </Pressable>
            <Pressable
              style={[s.actionBtn, { backgroundColor: "#ffffff11" }]}
              onPress={() => setExpanded(false)}
            >
              <Feather name="minimize-2" size={11} color="#888" />
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
