import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Alert, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useAutoClick, type Sequence } from "@/context/AutoClickContext";
import { useColors } from "@/hooks/useColors";

const STEP_ICONS: Record<string, string> = {
  tap_gift: "gift",
  watch_ad: "play-circle",
  skip_ad: "skip-forward",
  close_x: "x-circle",
  wait: "clock",
  tap_custom: "crosshair",
};

interface Props {
  sequence: Sequence;
  isPreset?: boolean;
}

export function SequenceCard({ sequence, isPreset }: Props) {
  const colors = useColors();
  const { startRun, deleteSequence, runState } = useAutoClick();
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;
  const isActive = runState?.sequenceId === sequence.id && runState.status === "running";

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startRun(sequence.id);
    router.push({ pathname: "/run/[id]", params: { id: sequence.id } });
  };

  const handleEdit = () => {
    if (isPreset) return;
    router.push({ pathname: "/builder", params: { id: sequence.id } });
  };

  const handleDelete = () => {
    if (isPreset) return;
    Alert.alert("Excluir", `Deseja excluir "${sequence.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deleteSequence(sequence.id);
        },
      },
    ]);
  };

  const s = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isActive ? colors.primary : colors.border,
    },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    name: { fontSize: 17, fontWeight: "700", color: colors.foreground, flex: 1 },
    badge: {
      backgroundColor: isPreset ? colors.accent + "22" : colors.muted,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginLeft: 8,
    },
    badgeText: { fontSize: 11, color: isPreset ? colors.accent : colors.mutedForeground, fontWeight: "600" },
    steps: { flexDirection: "row", marginTop: 12, gap: 6, flexWrap: "wrap" },
    stepIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    meta: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    metaText: { fontSize: 12, color: colors.mutedForeground },
    actions: { flexDirection: "row", gap: 8 },
    btn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    btnText: { color: colors.primaryForeground, fontWeight: "700", fontSize: 13 },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    activeBadge: {
      backgroundColor: colors.primary + "22",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
    activeText: { fontSize: 11, color: colors.primary, fontWeight: "700" },
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable style={s.card} onPress={handlePress}>
        <View style={s.row}>
          <Text style={s.name} numberOfLines={1}>{sequence.name}</Text>
          {isPreset && (
            <View style={s.badge}>
              <Text style={s.badgeText}>PRESET</Text>
            </View>
          )}
          {isActive && (
            <View style={s.activeBadge}>
              <View style={s.activeDot} />
              <Text style={s.activeText}>ATIVO</Text>
            </View>
          )}
        </View>

        <View style={s.steps}>
          {sequence.steps.map((step) => (
            <View key={step.id} style={s.stepIcon}>
              <Feather
                name={STEP_ICONS[step.type] as any}
                size={14}
                color={colors.mutedForeground}
              />
            </View>
          ))}
        </View>

        <View style={s.meta}>
          <Text style={s.metaText}>
            {sequence.steps.length} passos · {sequence.loopCount}x loop · {sequence.runsCompleted} execucoes
          </Text>
          <View style={s.actions}>
            {!isPreset && (
              <>
                <Pressable style={s.iconBtn} onPress={handleEdit}>
                  <Feather name="edit-2" size={14} color={colors.mutedForeground} />
                </Pressable>
                <Pressable style={s.iconBtn} onPress={handleDelete}>
                  <Feather name="trash-2" size={14} color={colors.destructive} />
                </Pressable>
              </>
            )}
            <Pressable style={s.btn} onPress={handleStart}>
              <Feather name="play" size={12} color={colors.primaryForeground} />
              <Text style={s.btnText}>Iniciar</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
