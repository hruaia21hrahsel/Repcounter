import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { Exercise, MuscleGroup } from '@/types/exercise';
import { MuscleGroupIcon } from '@/components/ui/badge';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface AddExerciseSheetProps {
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  onSelect: (exercise: Exercise) => void;
  sheetRef: React.RefObject<BottomSheet | null>;
}

export function AddExerciseSheet({ exercises, muscleGroups, onSelect, sheetRef }: AddExerciseSheetProps) {
  const [search, setSearch] = useState('');
  const [selectedMg, setSelectedMg] = useState<number | null>(null);
  const snapPoints = useMemo(() => ['70%', '90%'], []);

  const filtered = useMemo(() => {
    let exs = exercises;
    if (selectedMg) exs = exs.filter((e) => e.muscleGroupId === selectedMg);
    if (search) exs = exs.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
    return exs;
  }, [exercises, selectedMg, search]);

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    sheetRef.current?.close();
    setSearch('');
    setSelectedMg(null);
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.header}>
        <Text style={styles.title}>Add Exercise</Text>
        <View style={styles.searchRow}>
          <IconSymbol name="list.bullet" size={18} color={GymColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor={GymColors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <IconSymbol name="xmark" size={16} color={GymColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {/* Muscle group filter pills */}
        <FlatList
          data={[{ id: null, name: 'All', icon: '' } as any, ...muscleGroups]}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.pill,
                (item.id === null ? selectedMg === null : selectedMg === item.id) && styles.pillActive,
              ]}
              onPress={() => setSelectedMg(item.id ?? null)}
            >
              <Text
                style={[
                  styles.pillText,
                  (item.id === null ? selectedMg === null : selectedMg === item.id) && styles.pillTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheetView>

      <BottomSheetFlatList
        data={filtered as Exercise[]}
        keyExtractor={(item: Exercise) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: Exercise }) => (
          <TouchableOpacity
            style={styles.exerciseItem}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
            <MuscleGroupIcon name={item.muscleGroupName ?? ''} size={36} />
            <Text style={styles.exerciseName}>{item.name}</Text>
            <IconSymbol name="plus.circle.fill" size={24} color={GymColors.primary} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: GymColors.card,
  },
  indicator: {
    backgroundColor: GymColors.border,
    width: 40,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  title: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  searchInput: {
    flex: 1,
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    paddingVertical: Spacing.sm,
  },
  pillsContainer: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.card,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  pillActive: {
    backgroundColor: GymColors.primary,
    borderColor: GymColors.primary,
  },
  pillText: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  exerciseName: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: GymColors.border,
  },
});
