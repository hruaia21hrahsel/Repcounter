CREATE TABLE IF NOT EXISTS `muscle_groups` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `icon` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `exercises` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `muscle_group_id` integer NOT NULL REFERENCES `muscle_groups`(`id`),
  `equipment` text NOT NULL DEFAULT 'barbell',
  `mechanic` text NOT NULL DEFAULT 'compound',
  `is_custom` integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `workout_templates` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `template_exercises` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `template_id` integer NOT NULL REFERENCES `workout_templates`(`id`),
  `exercise_id` integer NOT NULL REFERENCES `exercises`(`id`),
  `target_sets` integer NOT NULL DEFAULT 3,
  `target_reps` integer NOT NULL DEFAULT 10,
  `target_weight` real NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `workouts` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `template_id` integer REFERENCES `workout_templates`(`id`),
  `started_at` integer NOT NULL,
  `finished_at` integer,
  `duration_secs` integer,
  `total_volume` real
);

CREATE TABLE IF NOT EXISTS `workout_exercises` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `workout_id` integer NOT NULL REFERENCES `workouts`(`id`),
  `exercise_id` integer NOT NULL REFERENCES `exercises`(`id`),
  `sort_order` integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `sets` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `workout_exercise_id` integer NOT NULL REFERENCES `workout_exercises`(`id`),
  `set_number` integer NOT NULL,
  `weight` real NOT NULL DEFAULT 0,
  `reps` integer NOT NULL DEFAULT 0,
  `rpe` real,
  `is_pr` integer NOT NULL DEFAULT 0,
  `rep_count_method` text NOT NULL DEFAULT 'manual'
);

CREATE TABLE IF NOT EXISTS `personal_records` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `exercise_id` integer NOT NULL REFERENCES `exercises`(`id`),
  `set_id` integer NOT NULL REFERENCES `sets`(`id`),
  `type` text NOT NULL,
  `value` real NOT NULL,
  `achieved_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `user_settings` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `weight_unit` text NOT NULL DEFAULT 'kg',
  `default_rest_secs` integer NOT NULL DEFAULT 90,
  `user_name` text NOT NULL DEFAULT 'Athlete'
);
