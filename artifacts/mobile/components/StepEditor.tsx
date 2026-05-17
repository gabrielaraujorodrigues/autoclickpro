import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { type Step, type StepType } from "@/context/AutoClickContext";
import { useColors } from "@/hooks/useColors";

const STEP_TYPES: { type: StepType; label: string; icon: string; color: string }[] = [
  { type: "tap_gift", label: "Clicar Presente", icon: "gift", color: "#00ff88" },
  { type: "watch_ad", label: "Assistir Anuncio", icon: "play-circle", color: "#00ccff" },
  { type: "skip_ad", label: "Pular Anuncio", icon: "skip-forward", color: "#ffaa00" },
  { type: "close_x", label: "Fechar (X)", icon: "x-circle", color: "#ff4444" },
  { type: "wait", label: "Aguardar", icon: "clock", color: "#888888" },
  { type: "tap_custom", label: "Toque Customizado", icon: "crosshair", color: "#cc88ff" },
];

interface Props {
  step: Step;
  index: number;
  onUpdate: (step: Step) => void;
  onDelete: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function StepEditor({ step, index, onUpdate, onDelete, onMoveUp, onMoveDown }: Props) {
  const colors = useColors();
  const info = STEP_TYPES.find((t) => t.type === step.type)!;

  const s = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    indexBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: info.color + "33",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    indexText: { fontSize: 11, fontWeight: "700", color: info.color },
    icon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: info.color + "22",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    typeLabel: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.foreground },
    moveBtn: {
      width: 28,
      height: 28,
      borderRadius: 7,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 4,
    },
    deleteBtn: {
      width: 28,
      height: 28,
      borderRadius: 7,
      backgroundColor: colors.destructive + "22",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 4,
    },
    typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
    typeChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    typeChipText: { fontSize: 11, fontWeight: "600" },
    row: { flexDirection: "row", gap: 10, marginBottom: 4 },
    field: { flex: 1 },
    label: { fontSize: 11, color: colors.mutedForeground, marginBottom: 4, fontWeight: "600" },
    input: {
      backgroundColor: colors.muted,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: colors.foreground,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.indexBadge}>
          <Text style={s.indexText}>{index + 1}</Text>
        </View>
        <View style={s.icon}>
          <Feather name={info.icon as any} size={16} color={info.color} />
        </View>
        <Text style={s.typeLabel}>{info.label}</Text>
        {onMoveUp && (
          <Pressable style={s.moveBtn} onPress={onMoveUp}>
            <Feather name="chevron-up" size={14} color={colors.mutedForeground} />
          </Pressable>
        )}
        {onMoveDown && (
          <Pressable style={s.moveBtn} onPress={onMoveDown}>
            <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
          </Pressable>
        )}
        <Pressable style={s.deleteBtn} onPress={() => onDelete(step.id)}>
          <Feather name="trash-2" size={13} color={colors.destructive} />
        </Pressable>
      </View>

      <View style={s.typeRow}>
        {STEP_TYPES.map((t) => {
          const active = t.type === step.type;
          return (
            <Pressable
              key={t.type}
              style={[
                s.typeChip,
                {
                  backgroundColor: active ? t.color + "22" : colors.muted,
                  borderColor: active ? t.color : colors.border,
                },
              ]}
              onPress={() => onUpdate({ ...step, type: t.type, label: t.label })}
            >
              <Feather name={t.icon as any} size={11} color={active ? t.color : colors.mutedForeground} />
              <Text style={[s.typeChipText, { color: active ? t.color : colors.mutedForeground }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={s.row}>
        <View style={s.field}>
          <Text style={s.label}>ATRASO ANTES (ms)</Text>
          <TextInput
            style={s.input}
            value={String(step.delay)}
            keyboardType="numeric"
            onChangeText={(v) => onUpdate({ ...step, delay: parseInt(v) || 0 })}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
        {step.type === "watch_ad" && (
          <View style={s.field}>
            <Text style={s.label}>DURACAO (ms)</Text>
            <TextInput
              style={s.input}
              value={String(step.duration ?? 30000)}
              keyboardType="numeric"
              onChangeText={(v) => onUpdate({ ...step, duration: parseInt(v) || 0 })}
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        )}
      </View>
    </View>
  );
}
