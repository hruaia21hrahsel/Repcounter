export type WeightUnit = 'kg' | 'lbs';
export type Equipment = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell' | 'band' | 'other';
export type Mechanic = 'compound' | 'isolation';

export interface MuscleGroup {
  id: number;
  name: string;
  icon: string;
}

export interface Exercise {
  id: number;
  name: string;
  muscleGroupId: number;
  muscleGroupName?: string;
  equipment: Equipment;
  mechanic: Mechanic;
  isCustom: boolean;
}
