import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StepEditor } from "@/components/StepEditor";
import { useAutoClick, type Sequence, type Step, type StepType } from "@/context/AutoClickContext";
import { useColors } from "@/hooks/useColors";

function makeId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

const STEP_TEMPLATES: { type: StepType; label: string; icon: string; color: string; delay: number; duration?: number }[] = [
  { type: "tap_gift", label: "Clicar Presente", icon: "gift", color: "#00ff88", delay: 1000 },
  { type: "watch_ad", label: "Assistir Anuncio", icon: "play-circle", color: "#00ccff", delay: 500, duration: 30000 },
  { type: "skip_ad", label: "Pular Anuncio", icon: "skip-forward", color: "#ffaa00", delay: 500 },
  { type: "close_x", label: "Fechar (X)", icon: "x-circle", color: "#ff4444", delay: 800 },
  { type: "wait", label: "Aguardar", icon: "clock", color: "#888888", delay: 2000 },
  { type: "tap_custom", label: "Toque Custom", icon: "crosshair", color: "#cc88ff", delay: 500 },
];

export default function BuilderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { sequences, addSequence, updateSequence } = useAutoClick();

  const existing = params.id ? sequences.find((s) => s.id === params.id) : null;

  const [name, setName] = useState(existing?.name ?? "Nova Sequencia");
  const [steps, setSteps] = useState<Step[]>(existing?.steps ?? []);
  const [loopCount, setLoopCount] = useState(String(existing?.loopCount ?? 1));
  const [showAddPanel, setShowAddPanel] = useState(false);

  const addStep = (template: typeof STEP_TEMPLATES[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newStep: Step = {
      id: makeId(),
      type: template.type,
      label: template.label,
      delay: template.delay,
      duration: template.duration,
    };
    setSteps((prev) => [...prev, newStep]);
    setShowAddPanel(false);
  };

  const updateStep = (updated: Step) => {
    setSteps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteStep = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...steps];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSteps(next);
  };

  const moveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const next = [...steps];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setSteps(next);
  };

  const handleSave = () => {
    if (!name.trim() || steps.length === 0) return;
    const seq: Sequence = {
      id: existing?.id ?? makeId(),
      name: name.trim(),
      steps,
      loopCount: parseInt(loopCount) || 1,
      createdAt: existing?.createdAt ?? Date.now(),
      runsCompleted: existing?.runsCompleted ?? 0,
    };
    if (existing) {
      updateSequence(seq);
    } else {
      addSequence(seq);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 12,
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    titleInput: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700",
      color: colors.foreground,
      backgroundColor: colors.card,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    saveBtnDisabled: { backgroundColor: colors.muted },
    saveBtnText: { fontWeight: "700", color: colors.primaryForeground, fontSize: 14 },
    scroll: { flex: 1 },
    content: { padding: 20, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 },
    loopRow: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
    },
    loopLabel: { fontSize: 14, fontWeight: "600", color: colors.foreground },
    loopSub: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
    loopInput: {
      width: 60,
      backgroundColor: colors.muted,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: colors.foreground,
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: { fontSize: 12, fontWeight: "700", color: colors.mutedForeground, letterSpacing: 1, marginBottom: 10 },
    emptySteps: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 28,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    emptyText: { fontSize: 14, color: colors.mutedForeground, marginTop: 8, textAlign: "center" },
    addPanel: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addPanelTitle: { fontSize: 13, fontWeight: "700", color: colors.mutedForeground, letterSpacing: 1, marginBottom: 12 },
    addGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    addChip: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minWidth: "45%",
    },
    addChipText: { fontSize: 12, fontWeight: "600" },
    addBtn: {
      borderRadius: 12,
      paddingVertical: 12,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: colors.border,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    addBtnText: { fontSize: 14, color: colors.mutedForeground, fontWeight: "600" },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="x" size={18} color={colors.mutedForeground} />
        </Pressable>
        <TextInput
          style={s.titleInput}
          value={name}
          onChangeText={setName}
          placeholder="Nome da sequencia"
          placeholderTextColor={colors.mutedForeground}
        />
        <Pressable
          style={[s.saveBtn, (!name.trim() || steps.length === 0) && s.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || steps.length === 0}
        >
          <Text style={s.saveBtnText}>Salvar</Text>
        </Pressable>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.loopRow}>
          <View>
            <Text style={s.loopLabel}>Repeticoes</Text>
            <Text style={s.loopSub}>Quantas vezes executar</Text>
          </View>
          <TextInput
            style={s.loopInput}
            value={loopCount}
            keyboardType="numeric"
            onChangeText={setLoopCount}
          />
        </View>

        <Text style={s.sectionTitle}>PASSOS DA SEQUENCIA</Text>

        {steps.length === 0 ? (
          <View style={s.emptySteps}>
            <Feather name="list" size={28} color={colors.mutedForeground} />
            <Text style={s.emptyText}>Nenhum passo adicionado.{"\n"}Adicione abaixo!</Text>
          </View>
        ) : (
          steps.map((step, i) => (
            <StepEditor
              key={step.id}
              step={step}
              index={i}
              onUpdate={updateStep}
              onDelete={deleteStep}
              onMoveUp={i > 0 ? () => moveUp(i) : undefined}
              onMoveDown={i < steps.length - 1 ? () => moveDown(i) : undefined}
            />
          ))
        )}

        {showAddPanel ? (
          <View style={s.addPanel}>
            <Text style={s.addPanelTitle}>ESCOLHA O TIPO DE PASSO</Text>
            <View style={s.addGrid}>
              {STEP_TEMPLATES.map((t) => (
                <Pressable
                  key={t.type}
                  style={[s.addChip, { backgroundColor: t.color + "15", borderColor: t.color + "55" }]}
                  onPress={() => addStep(t)}
                >
                  <Feather name={t.icon as any} size={14} color={t.color} />
                  <Text style={[s.addChipText, { color: t.color }]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <Pressable style={s.addBtn} onPress={() => setShowAddPanel(true)}>
            <Feather name="plus-circle" size={16} color={colors.mutedForeground} />
            <Text style={s.addBtnText}>Adicionar Passo</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
