import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { StyleSheet } from 'react-native';

import { migrateDb } from '@/db';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SQLiteProvider databaseName="reptracker.db" onInit={migrateDb}>
        <Stack screenOptions={{ contentStyle: { backgroundColor: '#F4F6FB' } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="workout/new"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="workout/[id]"
            options={{ headerShown: false, presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="workout/summary/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="workout/edit/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="exercise/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="exercise/create"
            options={{ headerShown: false, presentation: 'modal' }}
          />
        </Stack>
        <StatusBar style="dark" />
        <Toast />
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
