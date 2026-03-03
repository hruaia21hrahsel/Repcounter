import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useExercises } from '@/hooks/use-exercises';

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { exercises, muscleGroups, loading, search, setSearch, selectedMuscleGroup, setSelectedMuscleGroup } =
    useExercises();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Exercise Library</Text>
        <TouchableOpacity
          onPress={() => router.push('/exercise/create')}
          style={styles.addBtn}
          activeOpacity={0.7}
        >
          <IconSymbol name="plus" size={20} color={GymColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
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

      {/* Muscle group filter */}
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
              (item.id === null ? selectedMuscleGroup === null : selectedMuscleGroup === item.id) && styles.pillActive,
            ]}
            onPress={() => setSelectedMuscleGroup(item.id ?? null)}
          >
            <Text
              style={[
                styles.pillText,
                (item.id === null ? selectedMuscleGroup === null : selectedMuscleGroup === item.id) &&
                  styles.pillTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Exercise list */}
      {loading ? (
        <ActivityIndicator color={GymColors.primary} style={styles.loading} />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.exerciseItem}
              onPress={() => router.push(`/exercise/${item.id}`)}
              activeOpacity={0.7}
            >
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  title: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.elevated,
    borderWidth: 1,
    borderColor: GymColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: GymColors.border,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    paddingVertical: Spacing.sm,
  },
  pillsContainer: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
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
    color: GymColors.textPrimary,
  },
  loading: {
    marginTop: Spacing.xxl,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  exerciseInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  exerciseName: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  compoundBadge: {
    backgroundColor: GymColors.success + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  compoundText: {
    color: GymColors.success,
    fontSize: FontSize.xs,
    fontWeight: '600',
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
