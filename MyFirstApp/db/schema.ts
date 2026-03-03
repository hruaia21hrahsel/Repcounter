import { int, real, text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const muscleGroups = sqliteTable('muscle_groups', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
});

export const exercises = sqliteTable('exercises', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  muscleGroupId: int('muscle_group_id').notNull().references(() => muscleGroups.id),
  equipment: text('equipment').notNull().default('barbell'),
  mechanic: text('mechanic').notNull().default('compound'),
  isCustom: int('is_custom', { mode: 'boolean' }).notNull().default(false),
});

export const workoutTemplates = sqliteTable('workout_templates', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export const templateExercises = sqliteTable('template_exercises', {
  id: int('id').primaryKey({ autoIncrement: true }),
  templateId: int('template_id').notNull().references(() => workoutTemplates.id),
  exerciseId: int('exercise_id').notNull().references(() => exercises.id),
  targetSets: int('target_sets').notNull().default(3),
  targetReps: int('target_reps').notNull().default(10),
  targetWeight: real('target_weight').notNull().default(0),
});

export const workouts = sqliteTable('workouts', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  templateId: int('template_id').references(() => workoutTemplates.id),
  startedAt: int('started_at').notNull(),
  finishedAt: int('finished_at'),
  durationSecs: int('duration_secs'),
  totalVolume: real('total_volume'),
});

export const workoutExercises = sqliteTable('workout_exercises', {
  id: int('id').primaryKey({ autoIncrement: true }),
  workoutId: int('workout_id').notNull().references(() => workouts.id),
  exerciseId: int('exercise_id').notNull().references(() => exercises.id),
  sortOrder: int('sort_order').notNull().default(0),
});

export const sets = sqliteTable('sets', {
  id: int('id').primaryKey({ autoIncrement: true }),
  workoutExerciseId: int('workout_exercise_id').notNull().references(() => workoutExercises.id),
  setNumber: int('set_number').notNull(),
  weight: real('weight').notNull().default(0),
  reps: int('reps').notNull().default(0),
  rpe: real('rpe'),
  isPR: int('is_pr', { mode: 'boolean' }).notNull().default(false),
  repCountMethod: text('rep_count_method').notNull().default('manual'),
});

export const personalRecords = sqliteTable('personal_records', {
  id: int('id').primaryKey({ autoIncrement: true }),
  exerciseId: int('exercise_id').notNull().references(() => exercises.id),
  setId: int('set_id').notNull().references(() => sets.id),
  type: text('type').notNull(),
  value: real('value').notNull(),
  achievedAt: int('achieved_at').notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  id: int('id').primaryKey({ autoIncrement: true }),
  weightUnit: text('weight_unit').notNull().default('kg'),
  defaultRestSecs: int('default_rest_secs').notNull().default(90),
  userName: text('user_name').notNull().default('Athlete'),
});
