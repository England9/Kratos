export type TabId = "dashboard" | "nutrition" | "fitness";

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type FoodItem = {
  name: string;
  servingLabel: string;
  macrosPerUnit: MacroTotals;
};

export type FoodLog = {
  id: string;
  date: string;
  name: string;
  quantity: number;
  servingLabel: string;
  macros: MacroTotals;
};

export type QuestType =
  | "protein"
  | "calories"
  | "meal_count"
  | "workout_category"
  | "workout_any";

export type DailyQuest = {
  id: string;
  type: QuestType;
  title: string;
  target: number;
  progress: number;
  reward: number;
  category?: string;
  completed: boolean;
};

export type WorkoutSetLog = {
  reps: number;
  weight: number;
  completed: boolean;
};

export type WorkoutExerciseLog = {
  name: string;
  targetSets: number;
  targetReps: string;
  sets: WorkoutSetLog[];
};

export type WorkoutSession = {
  id: string;
  date: string;
  routineId: string;
  routineName: string;
  category: string;
  durationSeconds: number;
  totalVolume: number;
  exercises: WorkoutExerciseLog[];
};

export type RoutineExercise = {
  name: string;
  sets: number;
  reps: string;
  guidance: string;
};

export type WorkoutRoutine = {
  id: string;
  name: string;
  category: string;
  accent: string;
  summary: string;
  exercises: RoutineExercise[];
};

export type RewardEvent = {
  id: string;
  title: string;
  description: string;
  xpGained: number;
  leveledUp: boolean;
  level: number;
};

export type AppState = {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  questDate: string;
  dailyQuests: DailyQuest[];
  foodLogs: FoodLog[];
  workoutHistory: WorkoutSession[];
  macroBonusDates: string[];
};
