import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [haptics, setHaptics] = React.useState(true);
  const [notifications, setNotifications] = React.useState(false);
  const [loopDefault, setLoopDefault] = React.useState(false);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 12,
      paddingHorizontal: 20,
      paddingBottom: 20,
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
    title: { fontSize: 20, fontWeight: "800", color: colors.foreground },
    scroll: { flex: 1 },
    content: {
      padding: 20,
      paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20,
    },
    section: { marginBottom: 24 },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.mutedForeground,
      letterSpacing: 1.5,
      marginBottom: 8,
      marginLeft: 4,
    },
    permCard: {
      backgroundColor: colors.primary + "10",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary + "40",
      overflow: "hidden",
    },
    permRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 14,
    },
    permIcons: {
      flexDirection: "row",
      gap: -8,
      marginRight: 4,
    },
    permIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    permContent: { flex: 1 },
    permTitle: { fontSize: 15, fontWeight: "700", color: colors.primary },
    permSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    permBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    permBtnText: { fontSize: 13, fontWeight: "700", color: "#000" },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 14,
    },
    rowSep: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    rowContent: { flex: 1 },
    rowLabel: { fontSize: 15, fontWeight: "600", color: colors.foreground },
    rowSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
    version: {
      textAlign: "center",
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 32,
    },
  });

  const Row = ({
    icon,
    iconColor,
    label,
    sub,
    right,
    onPress,
  }: {
    icon: string;
    iconColor: string;
    label: string;
    sub?: string;
    right?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <Pressable style={s.row} onPress={onPress} disabled={!onPress && !right}>
      <View style={[s.iconBox, { backgroundColor: iconColor + "22" }]}>
        <Feather name={icon as any} size={17} color={iconColor} />
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowLabel}>{label}</Text>
        {sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      {right ?? (onPress ? <Feather name="chevron-right" size={16} color={colors.mutedForeground} /> : null)}
    </Pressable>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="x" size={18} color={colors.mutedForeground} />
        </Pressable>
        <Text style={s.title}>Configuracoes</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* PERMISSIONS SECTION */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>PERMISSOES DO SISTEMA</Text>
          <Pressable
            style={s.permCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/permissions");
            }}
          >
            <View style={s.permRow}>
              <View style={s.permIcons}>
                {[
                  { icon: "eye", color: "#00ff88" },
                  { icon: "layers", color: "#00ccff" },
                  { icon: "battery-charging", color: "#ffaa00" },
                ].map((item, i) => (
                  <View
                    key={i}
                    style={[
                      s.permIconCircle,
                      { backgroundColor: item.color + "22", zIndex: 3 - i, marginLeft: i === 0 ? 0 : -10 },
                    ]}
                  >
                    <Feather name={item.icon as any} size={13} color={item.color} />
                  </View>
                ))}
              </View>
              <View style={s.permContent}>
                <Text style={s.permTitle}>Ativar 3 Permissoes</Text>
                <Text style={s.permSub}>Acessibilidade · Sobreposicao · Bateria</Text>
              </View>
              <View style={s.permBtn}>
                <Text style={s.permBtnText}>Configurar</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* PREFERENCES */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>PREFERENCIAS</Text>
          <View style={s.card}>
            <Row
              icon="zap"
              iconColor={colors.warning}
              label="Feedback Haptico"
              sub="Vibracao ao executar cada passo"
              right={
                <Switch
                  value={haptics}
                  onValueChange={setHaptics}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="#fff"
                />
              }
            />
            <View style={s.rowSep} />
            <Row
              icon="bell"
              iconColor={colors.accent}
              label="Notificacoes"
              sub="Alerta ao finalizar sequencia"
              right={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="#fff"
                />
              }
            />
            <View style={s.rowSep} />
            <Row
              icon="refresh-cw"
              iconColor={colors.success}
              label="Loop infinito padrao"
              sub="Repetir sequencia ate pausar"
              right={
                <Switch
                  value={loopDefault}
                  onValueChange={setLoopDefault}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="#fff"
                />
              }
            />
          </View>
        </View>

        {/* ABOUT */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>SOBRE</Text>
          <View style={s.card}>
            <Row
              icon="shield"
              iconColor={colors.success}
              label="Privacidade"
              sub="Seus dados ficam so no dispositivo"
            />
            <View style={s.rowSep} />
            <Row
              icon="code"
              iconColor={colors.accent}
              label="Versao"
              sub="AutoClickPro v2.0 · Build GitHub Actions"
            />
          </View>
        </View>

        <Text style={s.version}>AutoClickPro © 2025 · Automacao Inteligente</Text>
      </ScrollView>
    </View>
  );
}
