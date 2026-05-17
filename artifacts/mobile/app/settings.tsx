import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
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
    infoCard: {
      backgroundColor: colors.primary + "10",
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.primary + "30",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    infoText: { flex: 1, fontSize: 13, color: colors.primary, lineHeight: 20 },
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
      {right ??
        (onPress ? (
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        ) : null)}
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
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACESSIBILIDADE</Text>
          <View style={s.infoCard}>
            <Feather name="info" size={18} color={colors.primary} />
            <Text style={s.infoText}>
              Para automacao completa no Android, ative o Servico de Acessibilidade em:
              {"\n\n"}Configuracoes → Acessibilidade → AutoClickPro → Ativar
            </Text>
          </View>
        </View>

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
          </View>
        </View>

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
              icon="star"
              iconColor={colors.warning}
              label="Avaliar o App"
              sub="Ajude-nos com uma avaliacao"
              onPress={() => Linking.openURL("https://apps.apple.com")}
            />
            <View style={s.rowSep} />
            <Row
              icon="code"
              iconColor={colors.accent}
              label="Versao"
              sub="AutoClickPro v2.0"
            />
          </View>
        </View>

        <Text style={s.version}>AutoClickPro © 2025 · Automacao Inteligente</Text>
      </ScrollView>
    </View>
  );
}
