import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AutoClickProvider } from "@/context/AutoClickContext";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AutoClickProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="builder" options={{ presentation: "modal" }} />
                <Stack.Screen name="run/[id]" options={{ presentation: "fullScreenModal" }} />
                <Stack.Screen name="settings" options={{ presentation: "modal" }} />
                <Stack.Screen name="permissions" options={{ presentation: "modal" }} />
              </Stack>
            </GestureHandlerRootView>
          </AutoClickProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
