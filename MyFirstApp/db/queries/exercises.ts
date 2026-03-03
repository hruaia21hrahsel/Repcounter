import { eq, like, and, desc } from 'drizzle-orm';
import { getDb } from '../index';
import { exercises, muscleGroups, sets, workoutExercises } from '../schema';

export async function getAllExercises() {
  const db = getDb();
  return db
    .select({
      id: exercises.id,
      name: exercises.name,
      muscleGroupId: exercises.muscleGroupId,
      muscleGroupName: muscleGroups.name,
      equipment: exercises.equipment,
      mechanic: exercises.mechanic,
      isCustom: exercises.isCustom,
    })
    .from(exercises)
    .leftJoin(muscleGroups, eq(exercises.muscleGroupId, muscleGroups.id))
    .orderBy(exercises.name);
}

export async function searchExercises(query: string, muscleGroupId?: number) {
  const db = getDb();
  const conditions = [like(exercises.name, `%${query}%`)];
  if (muscleGroupId) {
    conditions.push(eq(exercises.muscleGroupId, muscleGroupId));
  }
  return db
    .select({
      id: exercises.id,
      name: exercises.name,
      muscleGroupId: exercises.muscleGroupId,
      muscleGroupName: muscleGroups.name,
      equipment: exercises.equipment,
      mechanic: exercises.mechanic,
      isCustom: exercises.isCustom,
    })
    .from(exercises)
    .leftJoin(muscleGroups, eq(exercises.muscleGroupId, muscleGroups.id))
    .where(and(...conditions))
    .orderBy(exercises.name);
}

export async function getExerciseById(id: number) {
  const db = getDb();
  const result = await db
    .select({
      id: exercises.id,
      name: exercises.name,
      muscleGroupId: exercises.muscleGroupId,
      muscleGroupName: muscleGroups.name,
      equipment: exercises.equipment,
      mechanic: exercises.mechanic,
      isCustom: exercises.isCustom,
    })
    .from(exercises)
    .leftJoin(muscleGroups, eq(exercises.muscleGroupId, muscleGroups.id))
    .where(eq(exercises.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getExerciseHistory(exerciseId: number) {
  const db = getDb();
  return db
    .select({
      setId: sets.id,
      weight: sets.weight,
      reps: sets.reps,
      isPR: sets.isPR,
    })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(eq(workoutExercises.exerciseId, exerciseId))
    .orderBy(desc(sets.id))
    .limit(50);
}

export async function createExercise(data: {
  name: string;
  muscleGroupId: number;
  equipment: string;
  mechanic: string;
}) {
  const db = getDb();
  return db.insert(exercises).values({ ...data, isCustom: true } as any);
}

export async function getAllMuscleGroups() {
  const db = getDb();
  return db.select().from(muscleGroups).orderBy(muscleGroups.name);
}
