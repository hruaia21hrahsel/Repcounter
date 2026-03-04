import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Calendar } from 'react-native-calendars';

import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getWorkoutById,
  getWorkoutExercises,
  getWorkoutSets,
  updateWorkout,
  deleteWorkoutCascade,
} from '@/db/queries/workouts';
import { updateSet } from '@/db/queries/sets';
import { useSettingsStore } from '@/stores/settings-store';

interface EditSet {
  id: number;
  setNumber: number;
  weight: string;
  reps: string;
}

interface EditExercise {
  workoutExerciseId: number;
  exerciseName: string;
  sets: EditSet[];
}

export default function EditWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { weightUnit } = useSettingsStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [exercises, setExercises] = useState<EditExercise[]>([]);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const load = async () => {
      const workoutId = parseInt(id ?? '0');
      const [workout, exs] = await Promise.all([
        getWorkoutById(workoutId),
        getWorkoutExercises(workoutId),
      ]);
      if (!workout) return;

      setName(workout.name);
      setSelectedDate(format(new Date(workout.startedAt), 'yyyy-MM-dd'));

      const exercisesWithSets = await Promise.all(
        exs.map(async (ex) => {
          const rawSets = await getWorkoutSets(ex.id);
          return {
            workoutExerciseId: ex.id,
            exerciseName: ex.exerciseName,
            sets: rawSets.map((s) => ({
              id: s.id,
              setNumber: s.setNumber,
              weight: String(s.weight),
              reps: String(s.reps),
            })),
          };
        }),
      );
      setExercises(exercisesWithSets);
      setLoading(false);
    };
    load();
  }, [id]);

  const updateSetField = (
    exIdx: number,
    setIdx: number,
    field: 'weight' | 'reps',
    value: string,
  ) => {
    setExercises((prev) =>
      prev.map((ex, ei) =>
        ei !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si !== setIdx ? s : { ...s, [field]: value },
              ),
            },
      ),
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Workout name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const workoutId = parseInt(id ?? '0');
      const [year, month, day] = selectedDate.split('-').map(Number);
      const startedAt = new Date(year, month - 1, day, new Date().getHours(), new Date().getMinutes()).getTime();

      await updateWorkout(workoutId, { name: name.trim(), startedAt });

      await Promise.all(
        exercises.flatMap((ex) =>
          ex.sets.map((s) =>
            updateSet(s.id, {
              weight: parseFloat(s.weight) || 0,
              reps: parseInt(s.reps) || 0,
            }),
          ),
        ),
      );

      router.back();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout',
      'This will permanently delete this workout and all its sets. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const workoutId = parseInt(id ?? '0');
            await deleteWorkoutCascade(workoutId);
            router.replace('/history');
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={GymColors.primary} size="large" />
      </View>
    );
  }

  const displayDate = (() => {
    if (selectedDate === today) return 'Today';
    const [y, m, d] = selectedDate.split('-').map(Number);
    return format(new Date(y, m - 1, d), 'MMM d, yyyy');
  })();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <IconSymbol name="chevron.left" size={24} color={GymColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Workout</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} hitSlop={12}>
          {saving ? (
            <ActivityIndicator size="small" color={GymColors.primary} />
          ) : (
            <Text style={styles.saveBtn}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        <Card style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Workout Name</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Push Day"
            placeholderTextColor={GymColors.textMuted}
            returnKeyType="done"
          />
        </Card>

        {/* Date */}
        <Card style={styles.fieldCard}>
          <TouchableOpacity
            style={styles.dateRow}
            onPress={() => setShowCalendar((v) => !v)}
          >
            <View style={styles.dateLeft}>
              <IconSymbol name="calendar" size={18} color={GymColors.primary} />
              <Text style={styles.fieldLabel}>Date</Text>
            </View>
            <View style={styles.dateRight}>
              <Text style={styles.dateValue}>{displayDate}</Text>
              <IconSymbol
                name={showCalendar ? 'chevron.up' : 'chevron.down'}
                size={16}
                color={GymColors.textMuted}
              />
            </View>
          </TouchableOpacity>
          {showCalendar && (
            <Calendar
              current={selectedDate}
              maxDate={today}
              onDayPress={(day: { dateString: string }) => {
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: GymColors.primary },
              }}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: GymColors.textMuted,
                selectedDayBackgroundColor: GymColors.primary,
                selectedDayTextColor: GymColors.textPrimary,
                todayTextColor: GymColors.accent,
                dayTextColor: GymColors.textPrimary,
                textDisabledColor: GymColors.border,
                monthTextColor: GymColors.textPrimary,
                arrowColor: GymColors.primary,
              }}
            />
          )}
        </Card>

        {/* Exercises & sets */}
        <Text style={styles.sectionTitle}>Sets</Text>
        {exercises.map((ex, exIdx) => (
          <Card key={ex.workoutExerciseId} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
            {/* Column headers */}
            <View style={styles.setHeaderRow}>
              <Text style={[styles.colHeader, styles.colSet]}>Set</Text>
              <Text style={[styles.colHeader, styles.colWeight]}>Weight ({weightUnit})</Text>
              <Text style={[styles.colHeader, styles.colReps]}>Reps</Text>
            </View>
            {ex.sets.map((s, setIdx) => (
              <View key={s.id} style={styles.setRow}>
                <Text style={[styles.setNum, styles.colSet]}>{s.setNumber}</Text>
                <TextInput
                  style={[styles.setInput, styles.colWeight]}
                  value={s.weight}
                  onChangeText={(v) => updateSetField(exIdx, setIdx, 'weight', v)}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                />
                <TextInput
                  style={[styles.setInput, styles.colReps]}
                  value={s.reps}
                  onChangeText={(v) => updateSetField(exIdx, setIdx, 'reps', v)}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
              </View>
            ))}
          </Card>
        ))}

        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <IconSymbol name="trash" size={18} color={GymColors.danger} />
          <Text style={styles.deleteBtnText}>Delete Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GymColors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: GymColors.border,
  },
  headerTitle: {
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  saveBtn: {
    color: GymColors.primary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  scroll: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  fieldCard: {
    gap: Spacing.sm,
  },
  fieldLabel: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nameInput: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: GymColors.border,
    paddingVertical: Spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateValue: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  sectionTitle: {
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  exerciseCard: {
    gap: Spacing.sm,
  },
  exerciseName: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  setHeaderRow: {
    flexDirection: 'row',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: GymColors.border,
  },
  colHeader: {
    color: GymColors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setNum: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  setInput: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    backgroundColor: GymColors.elevated,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    textAlign: 'center',
  },
  colSet: {
    width: 36,
  },
  colWeight: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  colReps: {
    width: 72,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: GymColors.danger + '60',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  deleteBtnText: {
    color: GymColors.danger,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
