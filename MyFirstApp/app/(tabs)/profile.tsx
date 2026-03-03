import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettingsStore } from '@/stores/settings-store';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userName, weightUnit, defaultRestSecs, setUserName, setWeightUnit, setDefaultRestSecs, loadSettings, isLoaded } =
    useSettingsStore();
  const [nameInput, setNameInput] = useState(userName);

  useEffect(() => {
    if (!isLoaded) loadSettings();
  }, []);

  useEffect(() => {
    setNameInput(userName);
  }, [userName]);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    Toast.show({ type: 'success', text1: 'Name saved!' });
  };

  const restOptions = [60, 90, 120, 180];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* Name */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Your Name</Text>
          <View style={styles.nameRow}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name"
              placeholderTextColor={GymColors.textMuted}
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName} activeOpacity={0.7}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Weight unit */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Weight Unit</Text>
          <View style={styles.unitRow}>
            {(['kg', 'lbs'] as const).map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[styles.unitBtn, weightUnit === unit && styles.unitBtnActive]}
                onPress={() => setWeightUnit(unit)}
                activeOpacity={0.7}
              >
                <Text style={[styles.unitBtnText, weightUnit === unit && styles.unitBtnTextActive]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Rest timer */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Default Rest Timer</Text>
          <View style={styles.restRow}>
            {restOptions.map((secs) => (
              <TouchableOpacity
                key={secs}
                style={[styles.restBtn, defaultRestSecs === secs && styles.restBtnActive]}
                onPress={() => setDefaultRestSecs(secs)}
                activeOpacity={0.7}
              >
                <Text style={[styles.restBtnText, defaultRestSecs === secs && styles.restBtnTextActive]}>
                  {secs < 60 ? `${secs}s` : `${secs / 60}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About RepTracker</Text>
          <Text style={styles.aboutText}>Version 1.0.0</Text>
          <Text style={styles.aboutText}>Track your gym progress with voice-powered rep counting and comprehensive workout logging.</Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GymColors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  title: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    backgroundColor: GymColors.elevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  saveBtn: {
    backgroundColor: GymColors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  saveBtnText: {
    color: GymColors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  unitRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: GymColors.elevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  unitBtnActive: {
    backgroundColor: GymColors.primary,
    borderColor: GymColors.primary,
  },
  unitBtnText: {
    color: GymColors.textMuted,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  unitBtnTextActive: {
    color: GymColors.textPrimary,
  },
  restRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  restBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: GymColors.elevated,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  restBtnActive: {
    backgroundColor: GymColors.primary,
    borderColor: GymColors.primary,
  },
  restBtnText: {
    color: GymColors.textMuted,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  restBtnTextActive: {
    color: GymColors.textPrimary,
  },
  aboutText: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
  },
});
