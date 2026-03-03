import { SQLiteDatabase } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import { MUSCLE_GROUPS, SEED_EXERCISES } from '@/constants/exercises';
import { muscleGroups, exercises, userSettings } from './schema';
import { eq, count } from 'drizzle-orm';

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

// Singleton db reference (set once per SQLiteProvider)
let _db: DrizzleDb | null = null;

export function getDb(): DrizzleDb {
  if (!_db) throw new Error('Database not initialized. Ensure SQLiteProvider has run migrateDb.');
  return _db;
}

export async function migrateDb(rawDb: SQLiteDatabase) {
  _db = drizzle(rawDb, { schema });
  const db = _db;

  // Run schema creation manually (drizzle-kit migrations require native build)
  await rawDb.execAsync(`
    CREATE TABLE IF NOT EXISTS muscle_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      muscle_group_id INTEGER NOT NULL,
      equipment TEXT NOT NULL DEFAULT 'barbell',
      mechanic TEXT NOT NULL DEFAULT 'compound',
      is_custom INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(id)
    );

    CREATE TABLE IF NOT EXISTS workout_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS template_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      template_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      target_sets INTEGER NOT NULL DEFAULT 3,
      target_reps INTEGER NOT NULL DEFAULT 10,
      target_weight REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (template_id) REFERENCES workout_templates(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      template_id INTEGER,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      duration_secs INTEGER,
      total_volume REAL,
      FOREIGN KEY (template_id) REFERENCES workout_templates(id)
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      workout_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (workout_id) REFERENCES workouts(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      workout_exercise_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL,
      weight REAL NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      rpe REAL,
      is_pr INTEGER NOT NULL DEFAULT 0,
      rep_count_method TEXT NOT NULL DEFAULT 'manual',
      FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id)
    );

    CREATE TABLE IF NOT EXISTS personal_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      exercise_id INTEGER NOT NULL,
      set_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      value REAL NOT NULL,
      achieved_at INTEGER NOT NULL,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id),
      FOREIGN KEY (set_id) REFERENCES sets(id)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      weight_unit TEXT NOT NULL DEFAULT 'kg',
      default_rest_secs INTEGER NOT NULL DEFAULT 90,
      user_name TEXT NOT NULL DEFAULT 'Athlete'
    );
  `);

  // Seed initial data if empty
  const mgCount = await db.select({ count: count() }).from(muscleGroups);
  if (mgCount[0].count === 0) {
    await db.insert(muscleGroups).values(MUSCLE_GROUPS.map(mg => ({
      id: mg.id,
      name: mg.name,
      icon: mg.icon,
    })));

    await db.insert(exercises).values(SEED_EXERCISES.map(ex => ({
      name: ex.name,
      muscleGroupId: ex.muscleGroupId,
      equipment: ex.equipment as any,
      mechanic: ex.mechanic as any,
      isCustom: false,
    })));
  }

  // Seed default settings if empty
  const settingsCount = await db.select({ count: count() }).from(userSettings);
  if (settingsCount[0].count === 0) {
    await db.insert(userSettings).values({
      weightUnit: 'kg',
      defaultRestSecs: 90,
      userName: 'Athlete',
    });
  }
}
