import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MuscleGroupIcon } from '@/components/ui/badge';
import { useExercises } from '@/hooks/use-exercises';

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { exercises, muscleGroups, loading, search, setSearch, selectedMuscleGroup, setSelectedMuscleGroup } =
    useExercises();

  return (
    <View style={styles.root}>
      {/* ── Fixed header ── */}
      <View style={[styles.fixedTop, { paddingTop: insets.top }]}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Exercises</Text>
          <TouchableOpacity
            onPress={() => router.push('/exercise/create')}
            style={styles.addBtn}
            activeOpacity={0.7}
          >
            <IconSymbol name="plus" size={20} color={GymColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <IconSymbol name="list.bullet" size={18} color={GymColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor={GymColors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <IconSymbol name="xmark" size={16} color={GymColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Muscle group filter pills — ScrollView avoids nested-FlatList touch conflicts */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
          keyboardShouldPersistTaps="handled"
        >
          {[{ id: null, name: 'All' } as any, ...muscleGroups].map((item) => {
            const active = item.id === null ? selectedMuscleGroup === null : selectedMuscleGroup === item.id;
            return (
              <TouchableOpacity
                key={String(item.id)}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setSelectedMuscleGroup(item.id ?? null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Scrollable exercise list ── */}
      {loading ? (
        <ActivityIndicator color={GymColors.primary} style={styles.loading} />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.exerciseItem}
              onPress={() => router.push(`/exercise/${item.id}`)}
              activeOpacity={0.7}
            >
              <MuscleGroupIcon name={item.muscleGroupName ?? ''} size={38} />
              <Text style={styles.exerciseName}>{item.name}</Text>
              <IconSymbol name="chevron.right" size={16} color={GymColors.textMuted} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No exercises found</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GymColors.background,
  },

  /* ── Fixed top section ── */
  fixedTop: {
    backgroundColor: GymColors.background,
    borderBottomWidth: 1,
    borderBottomColor: GymColors.border,
    paddingBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  title: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: GymColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    height: 36,
  },

  /* ── Pills ── */
  pillsContainer: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
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

  /* ── List ── */
  loading: {
    marginTop: Spacing.xxl,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
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
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: GymColors.textMuted,
    fontSize: FontSize.md,
  },
});
