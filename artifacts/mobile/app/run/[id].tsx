import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PulseRing } from "@/components/PulseRing";
import { useAutoClick, type Step } from "@/context/AutoClickContext";
import { useColors } from "@/hooks/useColors";

const STEP_META: Record<string, { icon: string; color: string; label: string; desc: string }> = {
  tap_gift:   { icon: "gift",        color: "#00ff88", label: "Clicando no Presente",  desc: "Detectando e clicando no icone de presente..." },
  watch_ad:   { icon: "play-circle", color: "#00ccff", label: "Assistindo Anuncio",    desc: "Aguardando o anuncio terminar..." },
  skip_ad:    { icon: "skip-forward",color: "#ffaa00", label: "Pulando Anuncio",       desc: "Clicando no botao Pular Anuncio..." },
  close_x:    { icon: "x-circle",    color: "#ff4444", label: "Fechando (X)",          desc: "Clicando no X para fechar o anuncio..." },
  wait:       { icon: "clock",       color: "#888888", label: "Aguardando",            desc: "Pausando antes do proximo passo..." },
  tap_custom: { icon: "crosshair",   color: "#cc88ff", label: "Toque Customizado",     desc: "Executando toque customizado..." },
};

function formatMs(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

export default function RunScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { sequences, runState, startRun, pauseRun, resumeRun, stopRun, onStepComplete } = useAutoClick();

  const seq = sequences.find((s) => s.id === params.id);

  const [activeStepIdx, setActiveStepIdx] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isDone, setIsDone] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const animatePulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseScale, { toValue: 1.12, duration: 150, useNativeDriver: true }),
      Animated.timing(pulseScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [pulseScale]);

  useEffect(() => {
    onStepComplete((step: Step, idx: number) => {
      setActiveStepIdx(idx);
      setCompletedSteps((prev) => [...prev, idx]);
      animatePulse();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const totalMs = step.delay + (step.duration ?? 0);
      setCountdown(Math.round(totalMs / 1000));

      if (countdownRef.current) clearInterval(countdownRef.current);
      const start = Date.now();
      countdownRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, Math.round((totalMs - elapsed) / 1000));
        setCountdown(remaining);
        if (remaining === 0 && countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }, 200);
    });
  }, [onStepComplete, animatePulse]);

  useEffect(() => {
    if (!runState && completedSteps.length > 0) {
      setIsDone(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start();
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
  }, [runState, completedSteps.length, successAnim]);

  useEffect(() => {
    if (seq && !runState && !isDone) {
      startRun(params.id);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const handleStop = () => {
    stopRun();
    if (countdownRef.current) clearInterval(countdownRef.current);
    router.back();
  };

  const handleRestart = () => {
    setActiveStepIdx(null);
    setCompletedSteps([]);
    setIsDone(false);
    successAnim.setValue(0);
    startRun(params.id);
  };

  if (!seq) return null;

  const isPaused = runState?.status === "paused";
  const progress = runState?.progress ?? (isDone ? 1 : 0);
  const currentStep = activeStepIdx !== null ? seq.steps[activeStepIdx] : null;
  const currentMeta = currentStep ? STEP_META[currentStep.type] : null;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 12,
      paddingHorizontal: 20,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    stopBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.destructive + "22",
      alignItems: "center",
      justifyContent: "center",
    },
    body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
    circle: {
      width: 160,
      height: 160,
      borderRadius: 80,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 32,
    },
    circleInner: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: "center",
      justifyContent: "center",
    },
    countdown: { fontSize: 42, fontWeight: "800", color: colors.foreground, marginTop: 6 },
    countdownLabel: { fontSize: 12, color: colors.mutedForeground, fontWeight: "600" },
    stepLabel: { fontSize: 22, fontWeight: "800", color: colors.foreground, textAlign: "center", marginBottom: 8 },
    stepDesc: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", lineHeight: 20 },
    progressBar: {
      width: "100%",
      height: 4,
      backgroundColor: colors.muted,
      borderRadius: 2,
      marginTop: 32,
      overflow: "hidden",
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
    },
    progressLabel: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
      width: "100%",
    },
    progressText: { fontSize: 11, color: colors.mutedForeground, fontWeight: "600" },
    stepsRow: {
      flexDirection: "row",
      marginTop: 28,
      gap: 8,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    stepPip: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    controls: {
      paddingHorizontal: 24,
      paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 24,
      flexDirection: "row",
      gap: 12,
    },
    pauseBtn: {
      flex: 1,
      height: 56,
      borderRadius: 16,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      gap: 8,
    },
    pauseBtnText: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    successOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    successIcon: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary + "22",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.primary,
      marginBottom: 24,
    },
    successTitle: { fontSize: 28, fontWeight: "800", color: colors.foreground, marginBottom: 8 },
    successSub: { fontSize: 15, color: colors.mutedForeground, textAlign: "center", marginBottom: 32 },
    actionRow: { flexDirection: "row", gap: 12, width: "100%" },
    primaryBtn: {
      flex: 1,
      height: 56,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    primaryBtnText: { fontSize: 16, fontWeight: "700", color: colors.primaryForeground },
    secondaryBtn: {
      height: 56,
      width: 56,
      borderRadius: 16,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

  if (isDone) {
    const successScale = successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
    return (
      <Animated.View style={[s.container, { opacity: fadeAnim }]}>
        <View style={s.header}>
          <Text style={s.headerTitle}>{seq.name}</Text>
          <View style={{ width: 40 }} />
        </View>
        <Animated.View style={[s.successOverlay, { transform: [{ scale: successScale }] }]}>
          <View style={s.successIcon}>
            <Feather name="check" size={44} color={colors.primary} />
          </View>
          <Text style={s.successTitle}>Concluido!</Text>
          <Text style={s.successSub}>
            {completedSteps.length} passos executados com sucesso.{"\n"}Sequencia finalizada!
          </Text>
          <View style={s.actionRow}>
            <Pressable style={s.primaryBtn} onPress={handleRestart}>
              <Feather name="refresh-cw" size={18} color={colors.primaryForeground} />
              <Text style={s.primaryBtnText}>Executar Novamente</Text>
            </Pressable>
            <Pressable style={s.secondaryBtn} onPress={() => router.back()}>
              <Feather name="home" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    );
  }

  const accentColor = currentMeta?.color ?? colors.primary;

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      <View style={s.header}>
        <Pressable style={s.stopBtn} onPress={handleStop}>
          <Feather name="square" size={16} color={colors.destructive} />
        </Pressable>
        <Text style={s.headerTitle}>{seq.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.body}>
        <View style={{ position: "relative", width: 160, height: 160, alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <PulseRing color={accentColor} size={160} active={!!runState && !isPaused} />
          <Animated.View style={[
            s.circle,
            {
              position: "absolute",
              borderColor: accentColor + "55",
              transform: [{ scale: pulseScale }],
            },
          ]}>
            <View style={[s.circleInner, { backgroundColor: accentColor + "15" }]}>
              <Feather name={(currentMeta?.icon ?? "loader") as any} size={40} color={accentColor} />
              {countdown > 0 && (
                <Text style={[s.countdown, { color: accentColor, fontSize: 20, marginTop: 4 }]}>{countdown}s</Text>
              )}
            </View>
          </Animated.View>
        </View>

        <Text style={s.stepLabel}>{currentMeta?.label ?? "Iniciando..."}</Text>
        <Text style={s.stepDesc}>{currentMeta?.desc ?? "Preparando automacao..."}</Text>

        <View style={s.progressBar}>
          <Animated.View
            style={[
              s.progressFill,
              { width: `${Math.round(progress * 100)}%`, backgroundColor: accentColor },
            ]}
          />
        </View>
        <View style={s.progressLabel}>
          <Text style={s.progressText}>
            Passo {Math.min((activeStepIdx ?? -1) + 1, seq.steps.length)} de {seq.steps.length}
          </Text>
          <Text style={s.progressText}>{Math.round(progress * 100)}%</Text>
        </View>

        <View style={s.stepsRow}>
          {seq.steps.map((step, i) => {
            const meta = STEP_META[step.type];
            const isActive = i === activeStepIdx;
            const isDoneStep = completedSteps.includes(i) && i !== activeStepIdx;
            return (
              <View
                key={step.id}
                style={[
                  s.stepPip,
                  {
                    backgroundColor: isActive
                      ? meta.color + "22"
                      : isDoneStep
                      ? meta.color + "11"
                      : colors.muted,
                    borderColor: isActive
                      ? meta.color
                      : isDoneStep
                      ? meta.color + "55"
                      : colors.border,
                  },
                ]}
              >
                <Feather
                  name={(isDoneStep ? "check" : meta.icon) as any}
                  size={14}
                  color={isActive ? meta.color : isDoneStep ? meta.color : colors.mutedForeground}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View style={s.controls}>
        <Pressable
          style={s.pauseBtn}
          onPress={() => {
            if (isPaused) {
              resumeRun();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else {
              pauseRun();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }}
        >
          <Feather name={isPaused ? "play" : "pause"} size={20} color={colors.foreground} />
          <Text style={s.pauseBtnText}>{isPaused ? "Continuar" : "Pausar"}</Text>
        </Pressable>
        <Pressable style={[s.pauseBtn, { flex: 0, width: 56, backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "44" }]} onPress={handleStop}>
          <Feather name="square" size={20} color={colors.destructive} />
        </Pressable>
      </View>
    </Animated.View>
  );
}
