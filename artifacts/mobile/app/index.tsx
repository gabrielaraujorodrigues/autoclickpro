import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SequenceCard } from "@/components/SequenceCard";
import { useAutoClick } from "@/context/AutoClickContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sequences, totalRuns, runState } = useAutoClick();

  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim, glowAnim]);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  const presetSeq = sequences.find((s) => s.id === "preset_gift_ad")!;
  const customSeqs = sequences.filter((s) => s.id !== "preset_gift_ad");

  const totalSteps = sequences.reduce((acc, s) => acc + s.steps.length, 0);
  const totalCompleted = sequences.reduce((acc, s) => acc + s.runsCompleted, 0);

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    logo: { flexDirection: "row", alignItems: "center", gap: 10 },
    logoIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primary + "22",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primary + "44",
    },
    appName: { fontSize: 22, fontWeight: "800", color: colors.foreground },
    appSub: { fontSize: 11, color: colors.primary, fontWeight: "600", letterSpacing: 2 },
    settingsBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: { fontSize: 26, fontWeight: "800", color: colors.foreground },
    statLabel: { fontSize: 11, color: colors.mutedForeground, fontWeight: "600", marginTop: 2 },
    activeBanner: {
      marginTop: 12,
      backgroundColor: colors.primary + "15",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.primary + "44",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    activeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    activeBannerText: { flex: 1, fontSize: 13, color: colors.primary, fontWeight: "600" },
    viewBtn: { fontSize: 12, color: colors.primary, fontWeight: "700" },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80,
    },
    section: { marginBottom: 24 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.mutedForeground, letterSpacing: 1 },
    quickStart: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    quickStartIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: "rgba(0,0,0,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    quickStartContent: { flex: 1 },
    quickStartTitle: { fontSize: 17, fontWeight: "800", color: "#000" },
    quickStartSub: { fontSize: 13, color: "#000000aa", marginTop: 2 },
    quickStartSteps: { flexDirection: "row", marginTop: 10, gap: 6, alignItems: "center" },
    stepDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    stepDotActive: { backgroundColor: "#000" },
    playBtn: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: "rgba(0,0,0,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    addBtn: {
      height: 46,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    addBtnText: { fontSize: 14, color: colors.mutedForeground, fontWeight: "600" },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: { fontSize: 14, color: colors.mutedForeground, marginTop: 8, textAlign: "center" },
    fab: {
      position: "absolute",
      bottom: (Platform.OS === "web" ? 34 : insets.bottom) + 16,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
  });

  const handleQuickStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({ pathname: "/run/[id]", params: { id: "preset_gift_ad" } });
  };

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      <View style={s.header}>
        <View style={s.topRow}>
          <View style={s.logo}>
            <Animated.View style={[s.logoIcon, { opacity: glowOpacity }]}>
              <Feather name="crosshair" size={18} color={colors.primary} />
            </Animated.View>
            <View>
              <Text style={s.appName}>AutoClickPro</Text>
              <Text style={s.appSub}>AUTOMACAO INTELIGENTE</Text>
            </View>
          </View>
          <Pressable style={s.settingsBtn} onPress={() => router.push("/settings")}>
            <Feather name="settings" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statValue, { color: colors.primary }]}>{totalCompleted}</Text>
            <Text style={s.statLabel}>EXECUCOES</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statValue, { color: colors.accent }]}>{sequences.length}</Text>
            <Text style={s.statLabel}>SEQUENCIAS</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statValue, { color: colors.warning }]}>{totalSteps}</Text>
            <Text style={s.statLabel}>TOTAL PASSOS</Text>
          </View>
        </View>

        {!runState && (
          <Pressable
            style={[s.activeBanner, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "44" }]}
            onPress={() => router.push("/permissions")}
          >
            <Feather name="alert-triangle" size={14} color={colors.warning} />
            <Text style={[s.activeBannerText, { color: colors.warning }]}>
              Ative as 3 permissoes para automacao completa
            </Text>
            <Text style={[s.viewBtn, { color: colors.warning }]}>Ativar</Text>
          </Pressable>
        )}

        {runState && (
          <Pressable
            style={s.activeBanner}
            onPress={() =>
              router.push({ pathname: "/run/[id]", params: { id: runState.sequenceId } })
            }
          >
            <View style={s.activeDot} />
            <Text style={s.activeBannerText}>Automacao em execucao...</Text>
            <Text style={s.viewBtn}>Ver</Text>
          </Pressable>
        )}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>INICIO RAPIDO</Text>
          </View>
          <Pressable style={s.quickStart} onPress={handleQuickStart}>
            <View style={s.quickStartIcon}>
              <Feather name="zap" size={24} color="#000" />
            </View>
            <View style={s.quickStartContent}>
              <Text style={s.quickStartTitle}>Presente + Anuncio</Text>
              <Text style={s.quickStartSub}>Clica presente, assiste, pula e fecha</Text>
              <View style={s.quickStartSteps}>
                {presetSeq.steps.map((_, i) => (
                  <View key={i} style={[s.stepDot, i === 0 && s.stepDotActive]} />
                ))}
                <Text style={{ fontSize: 10, color: "#000000aa", marginLeft: 4 }}>
                  {presetSeq.steps.length} passos automaticos
                </Text>
              </View>
            </View>
            <View style={s.playBtn}>
              <Feather name="play" size={22} color="#000" />
            </View>
          </Pressable>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>MINHAS SEQUENCIAS</Text>
            <Pressable onPress={() => router.push("/builder")}>
              <Text style={{ fontSize: 12, color: colors.accent, fontWeight: "700" }}>+ NOVA</Text>
            </Pressable>
          </View>

          <SequenceCard sequence={presetSeq} isPreset />

          {customSeqs.length === 0 ? (
            <View style={s.emptyCard}>
              <Feather name="layers" size={28} color={colors.mutedForeground} />
              <Text style={s.emptyText}>Nenhuma sequencia customizada.{"\n"}Crie uma nova!</Text>
            </View>
          ) : (
            customSeqs.map((seq) => <SequenceCard key={seq.id} sequence={seq} />)
          )}

          <Pressable style={s.addBtn} onPress={() => router.push("/builder")}>
            <Feather name="plus" size={16} color={colors.mutedForeground} />
            <Text style={s.addBtnText}>Nova Sequencia</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Pressable
        style={s.fab}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/builder");
        }}
      >
        <Feather name="plus" size={24} color={colors.primaryForeground} />
      </Pressable>
    </Animated.View>
  );
}
