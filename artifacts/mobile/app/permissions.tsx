import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as IntentLauncher from "expo-intent-launcher";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const APP_PACKAGE = "com.autoclickpro.app";

interface Permission {
  id: string;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  why: string;
  step: string;
}

const PERMISSIONS: Permission[] = [
  {
    id: "accessibility",
    icon: "eye",
    color: "#00ff88",
    title: "Servico de Acessibilidade",
    subtitle: "Permite clicar automaticamente em outros apps",
    why: "Sem essa permissao o app NAO consegue clicar no presente, pular anuncio ou fechar o X.",
    step: "Acessibilidade → Apps instalados → AutoClickPro → Ativar",
  },
  {
    id: "overlay",
    icon: "layers",
    color: "#00ccff",
    title: "Sobrepor sobre outros apps",
    subtitle: "Mostra o botao flutuante enquanto voce usa outros apps",
    why: "Necessario para exibir o controle de automacao por cima do app alvo.",
    step: "Encontre AutoClickPro na lista e ative a opcao",
  },
  {
    id: "battery",
    icon: "battery-charging",
    color: "#ffaa00",
    title: "Ignorar otimizacao de bateria",
    subtitle: "Mantém a automacao rodando sem ser pausada",
    why: "O Android pode pausar o app em segundo plano. Isso evita interrupcoes durante a automacao.",
    step: "Selecione 'Nao otimizar' ou 'Permitir' para AutoClickPro",
  },
];

function PermissionCard({
  permission,
  index,
  onOpen,
}: {
  permission: Permission;
  index: number;
  onOpen: (id: string) => void;
}) {
  const colors = useColors();
  const [granted, setGranted] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const checkAnim = useRef(new Animated.Value(0)).current;

  const markGranted = useCallback(() => {
    setGranted(true);
    Animated.spring(checkAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 }).start();
  }, [checkAnim]);

  const s = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: granted ? permission.color + "55" : colors.border,
      marginBottom: 14,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 18,
      gap: 14,
    },
    numBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: granted ? permission.color + "22" : colors.muted,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: granted ? permission.color : colors.border,
    },
    numText: {
      fontSize: 13,
      fontWeight: "800",
      color: granted ? permission.color : colors.mutedForeground,
    },
    iconBox: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: granted ? permission.color + "22" : colors.muted,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: granted ? permission.color + "55" : colors.border,
    },
    content: { flex: 1 },
    title: { fontSize: 15, fontWeight: "700", color: colors.foreground },
    sub: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    checkCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: granted ? permission.color : colors.muted,
    },
    expandedArea: {
      paddingHorizontal: 18,
      paddingBottom: 18,
      gap: 12,
    },
    whyBox: {
      backgroundColor: permission.color + "10",
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: permission.color + "30",
    },
    whyText: { fontSize: 13, color: permission.color, lineHeight: 19 },
    stepBox: {
      backgroundColor: colors.muted,
      borderRadius: 10,
      padding: 12,
    },
    stepLabel: { fontSize: 10, fontWeight: "700", color: colors.mutedForeground, letterSpacing: 1, marginBottom: 4 },
    stepText: { fontSize: 13, color: colors.foreground, lineHeight: 19 },
    sep: { height: 1, backgroundColor: colors.border, marginHorizontal: 18 },
    btnRow: { flexDirection: "row", gap: 10 },
    openBtn: {
      flex: 1,
      height: 46,
      borderRadius: 12,
      backgroundColor: permission.color,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    openBtnText: { fontSize: 14, fontWeight: "700", color: "#000" },
    doneBtn: {
      height: 46,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    doneBtnText: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground },
  });

  return (
    <View style={s.card}>
      <Pressable
        style={s.header}
        onPress={() => setExpanded((p) => !p)}
      >
        <View style={s.numBadge}>
          <Text style={s.numText}>{index + 1}</Text>
        </View>
        <View style={s.iconBox}>
          <Feather name={permission.icon as any} size={20} color={granted ? permission.color : colors.mutedForeground} />
        </View>
        <View style={s.content}>
          <Text style={s.title}>{permission.title}</Text>
          <Text style={s.sub}>{permission.subtitle}</Text>
        </View>
        <Animated.View style={[s.checkCircle, { transform: [{ scale: checkAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
          <Feather name={granted ? "check" : "chevron-down"} size={15} color={granted ? "#000" : colors.mutedForeground} />
        </Animated.View>
      </Pressable>

      {(expanded || !granted) && (
        <>
          <View style={s.sep} />
          <View style={s.expandedArea}>
            <View style={s.whyBox}>
              <Text style={s.whyText}>⚡ {permission.why}</Text>
            </View>
            <View style={s.stepBox}>
              <Text style={s.stepLabel}>COMO ATIVAR</Text>
              <Text style={s.stepText}>{permission.step}</Text>
            </View>
            <View style={s.btnRow}>
              <Pressable
                style={s.openBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onOpen(permission.id);
                }}
              >
                <Feather name="external-link" size={15} color="#000" />
                <Text style={s.openBtnText}>Abrir Configuracoes</Text>
              </Pressable>
              <Pressable style={s.doneBtn} onPress={markGranted}>
                <Text style={s.doneBtnText}>Ja ativei ✓</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

export default function PermissionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const appState = useRef(AppState.currentState);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  // Re-check when user returns from system settings
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        // User came back — could trigger a re-check here
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  const openPermission = useCallback(async (id: string) => {
    if (Platform.OS !== "android") {
      Alert.alert("Android necessario", "Estas permissoes so existem no Android.");
      return;
    }
    try {
      if (id === "accessibility") {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.ACCESSIBILITY_SETTINGS
        );
      } else if (id === "overlay") {
        await IntentLauncher.startActivityAsync(
          "android.settings.action.MANAGE_OVERLAY_PERMISSION",
          { data: `package:${APP_PACKAGE}` }
        );
      } else if (id === "battery") {
        await IntentLauncher.startActivityAsync(
          "android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
          { data: `package:${APP_PACKAGE}` }
        );
      }
    } catch {
      // Fallback: open app settings
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
          { data: `package:${APP_PACKAGE}` }
        );
      } catch {
        Alert.alert("Erro", "Nao foi possivel abrir as configuracoes. Va manualmente em Configuracoes > Apps > AutoClickPro.");
      }
    }
  }, []);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 12,
      paddingHorizontal: 20,
      paddingBottom: 8,
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
    titleBlock: { flex: 1 },
    title: { fontSize: 20, fontWeight: "800", color: colors.foreground },
    sub: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    banner: {
      marginHorizontal: 20,
      marginBottom: 16,
      backgroundColor: colors.warning + "15",
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.warning + "40",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    bannerText: { flex: 1, fontSize: 13, color: colors.warning, lineHeight: 19 },
    scroll: { flex: 1 },
    content: {
      padding: 20,
      paddingTop: 4,
      paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20,
    },
    doneCard: {
      backgroundColor: colors.primary + "15",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.primary + "40",
      alignItems: "center",
      marginTop: 8,
      gap: 10,
    },
    doneTitle: { fontSize: 18, fontWeight: "800", color: colors.primary },
    doneSub: { fontSize: 13, color: colors.mutedForeground, textAlign: "center" },
    doneBtn: {
      marginTop: 4,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    doneBtnText: { fontWeight: "700", color: "#000", fontSize: 15 },
  });

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.mutedForeground} />
        </Pressable>
        <View style={s.titleBlock}>
          <Text style={s.title}>Permissoes</Text>
          <Text style={s.sub}>3 permissoes necessarias para automacao</Text>
        </View>
      </View>

      <View style={s.banner}>
        <Feather name="alert-triangle" size={16} color={colors.warning} style={{ marginTop: 1 }} />
        <Text style={s.bannerText}>
          Ative as 3 permissoes abaixo para que o AutoClickPro possa clicar no presente, assistir e fechar anuncios automaticamente.
        </Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {PERMISSIONS.map((p, i) => (
          <PermissionCard
            key={p.id}
            permission={p}
            index={i}
            onOpen={openPermission}
          />
        ))}

        <View style={s.doneCard}>
          <Feather name="check-circle" size={32} color={colors.primary} />
          <Text style={s.doneTitle}>Tudo ativado?</Text>
          <Text style={s.doneSub}>
            Com as 3 permissoes ativas, a automacao vai clicar sozinha no presente, assistir o anuncio e fechar o X automaticamente.
          </Text>
          <Pressable style={s.doneBtn} onPress={() => router.back()}>
            <Text style={s.doneBtnText}>Comecar a Automatizar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Animated.View>
  );
}
