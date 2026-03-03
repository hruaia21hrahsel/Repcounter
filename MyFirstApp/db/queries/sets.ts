import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../index';
import { sets, personalRecords, workoutExercises } from '../schema';

export async function saveSet(data: {
  workoutExerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  repCountMethod: string;
}) {
  const db = getDb();

  // Check for PR: get best weight for this exercise
  const weId = data.workoutExerciseId;
  const prevSets = await db
    .select({ weight: sets.weight, reps: sets.reps })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workoutExercises.exerciseId,
          db
            .select({ exerciseId: workoutExercises.exerciseId })
            .from(workoutExercises)
            .where(eq(workoutExercises.id, weId))
            .limit(1) as any,
        )
      )
    )
    .orderBy(desc(sets.weight))
    .limit(1);

  // Simple 1RM estimate: weight × (1 + reps/30)
  const estimated1RM = data.weight * (1 + data.reps / 30);
  const prev1RM = prevSets.length > 0
    ? prevSets[0].weight * (1 + prevSets[0].reps / 30)
    : 0;
  const isPR = estimated1RM > prev1RM && prev1RM > 0;

  const result = await db
    .insert(sets)
    .values({
      workoutExerciseId: data.workoutExerciseId,
      setNumber: data.setNumber,
      weight: data.weight,
      reps: data.reps,
      rpe: data.rpe ?? null,
      isPR,
      repCountMethod: data.repCountMethod,
    })
    .returning({ id: sets.id });

  return { id: result[0].id, isPR };
}

export async function updateSet(
  id: number,
  data: { weight?: number; reps?: number; rpe?: number; isPR?: boolean },
) {
  const db = getDb();
  return db.update(sets).set(data as any).where(eq(sets.id, id));
}

export async function deleteSet(id: number) {
  const db = getDb();
  return db.delete(sets).where(eq(sets.id, id));
}

export async function savePR(data: {
  exerciseId: number;
  setId: number;
  type: string;
  value: number;
}) {
  const db = getDb();
  return db.insert(personalRecords).values({
    exerciseId: data.exerciseId,
    setId: data.setId,
    type: data.type,
    value: data.value,
    achievedAt: Date.now(),
  });
}

export async function getExercisePRs(exerciseId: number) {
  const db = getDb();
  return db
    .select()
    .from(personalRecords)
    .where(eq(personalRecords.exerciseId, exerciseId))
    .orderBy(desc(personalRecords.achievedAt));
}
