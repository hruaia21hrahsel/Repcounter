import { useState, useEffect, useCallback } from 'react';
import { getAllExercises, searchExercises, getAllMuscleGroups } from '@/db/queries/exercises';
import { Exercise, MuscleGroup } from '@/types/exercise';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [exs, mgs] = await Promise.all([
        search || selectedMuscleGroup
          ? searchExercises(search, selectedMuscleGroup ?? undefined)
          : getAllExercises(),
        muscleGroups.length === 0 ? getAllMuscleGroups() : Promise.resolve(muscleGroups),
      ]);
      setExercises(exs as Exercise[]);
      if (muscleGroups.length === 0) setMuscleGroups(mgs as MuscleGroup[]);
    } catch (e) {
      console.error('Failed to load exercises:', e);
    } finally {
      setLoading(false);
    }
  }, [search, selectedMuscleGroup]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    exercises,
    muscleGroups,
    loading,
    search,
    setSearch,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    refresh: load,
  };
}
