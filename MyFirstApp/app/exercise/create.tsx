import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { createExercise, getAllMuscleGroups } from '@/db/queries/exercises';

const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'kettlebell', 'band', 'other'];
const MECHANIC_OPTIONS = ['compound', 'isolation'];

export default function CreateExerciseScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [muscleGroupId, setMuscleGroupId] = useState<number | null>(null);
  const [equipment, setEquipment] = useState('barbell');
  const [mechanic, setMechanic] = useState('compound');
  const [muscleGroups, setMuscleGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllMuscleGroups().then(setMuscleGroups);
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter an exercise name.');
      return;
    }
    if (!muscleGroupId) {
      Alert.alert('Missing Muscle Group', 'Please select a muscle group.');
      return;
    }
    setLoading(true);
    try {
      await createExercise({ name: name.trim(), muscleGroupId, equipment, mechanic });
      Toast.show({ type: 'success', text1: 'Exercise created!' });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to create exercise' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <IconSymbol name="xmark" size={20} color={GymColors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.title}>New Exercise</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Name */}
        <Text style={styles.label}>Exercise Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Incline Dumbbell Press"
          placeholderTextColor={GymColors.textMuted}
        />

        {/* Muscle Group */}
        <Text style={styles.label}>Muscle Group</Text>
        <View style={styles.options}>
          {muscleGroups.map((mg) => (
            <TouchableOpacity
              key={mg.id}
              style={[styles.option, muscleGroupId === mg.id && styles.optionActive]}
              onPress={() => setMuscleGroupId(mg.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, muscleGroupId === mg.id && styles.optionTextActive]}>
                {mg.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Equipment */}
        <Text style={styles.label}>Equipment</Text>
        <View style={styles.options}>
          {EQUIPMENT_OPTIONS.map((eq) => (
            <TouchableOpacity
              key={eq}
              style={[styles.option, equipment === eq && styles.optionActive]}
              onPress={() => setEquipment(eq)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, equipment === eq && styles.optionTextActive]}>
                {eq}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mechanic */}
        <Text style={styles.label}>Mechanic</Text>
        <View style={styles.options}>
          {MECHANIC_OPTIONS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.option, mechanic === m && styles.optionActive]}
              onPress={() => setMechanic(m)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, mechanic === m && styles.optionTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button title="Create Exercise" onPress={handleCreate} loading={loading} size="lg" style={styles.createBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GymColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  title: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  scroll: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  label: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  input: {
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  option: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.card,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  optionActive: {
    backgroundColor: GymColors.primary,
    borderColor: GymColors.primary,
  },
  optionText: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  optionTextActive: {
    color: GymColors.textPrimary,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: GymColors.border,
  },
  createBtn: {
    width: '100%',
  },
});
