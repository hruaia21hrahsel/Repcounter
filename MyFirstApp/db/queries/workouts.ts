import { eq, desc, isNull, isNotNull } from 'drizzle-orm';
import { getDb } from '../index';
import { workouts, workoutExercises, exercises, sets, muscleGroups } from '../schema';

export async function createWorkout(name: string) {
  const db = getDb();
  const result = await db
    .insert(workouts)
    .values({ name, startedAt: Date.now() })
    .returning({ id: workouts.id });
  return result[0].id;
}

export async function getActiveWorkout() {
  const db = getDb();
  const result = await db
    .select()
    .from(workouts)
    .where(isNull(workouts.finishedAt))
    .orderBy(desc(workouts.startedAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getRecentWorkouts(limit = 20) {
  const db = getDb();
  return db
    .select()
    .from(workouts)
    .where(isNotNull(workouts.finishedAt))
    .orderBy(desc(workouts.startedAt))
    .limit(limit);
}

export async function getWorkoutById(id: number) {
  const db = getDb();
  const result = await db.select().from(workouts).where(eq(workouts.id, id)).limit(1);
  return result[0] ?? null;
}

export async function finishWorkout(
  workoutId: number,
  durationSecs: number,
  totalVolume: number,
) {
  const db = getDb();
  return db
    .update(workouts)
    .set({ finishedAt: Date.now(), durationSecs, totalVolume })
    .where(eq(workouts.id, workoutId));
}

export async function addExerciseToWorkout(workoutId: number, exerciseId: number, sortOrder: number) {
  const db = getDb();
  const result = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, sortOrder })
    .returning({ id: workoutExercises.id });
  return result[0].id;
}

export async function getWorkoutExercises(workoutId: number) {
  const db = getDb();
  return db
    .select({
      id: workoutExercises.id,
      workoutId: workoutExercises.workoutId,
      exerciseId: workoutExercises.exerciseId,
      exerciseName: exercises.name,
      muscleGroupName: muscleGroups.name,
      sortOrder: workoutExercises.sortOrder,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .leftJoin(muscleGroups, eq(exercises.muscleGroupId, muscleGroups.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.sortOrder);
}

export async function getWorkoutSets(workoutExerciseId: number) {
  const db = getDb();
  return db
    .select()
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId))
    .orderBy(sets.setNumber);
}

export async function deleteWorkout(id: number) {
  const db = getDb();
  return db.delete(workouts).where(eq(workouts.id, id));
}
