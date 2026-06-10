import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { DAILY_TARGETS, addMacros, emptyMacros } from "../data/foods";
import type {
  AppState,
  DailyQuest,
  FoodLog,
  MacroTotals,
  RewardEvent,
  WorkoutSession,
} from "../types/app";

const STORAGE_KEY = "kratos-gamified-fitness-state";
const QUEST_REWARD = 30;

type AppContextValue = {
  state: AppState;
  today: string;
  targets: MacroTotals;
  todaysFoodLogs: FoodLog[];
  todaysMacros: MacroTotals;
  todaysWorkouts: WorkoutSession[];
  xpForCurrentLevel: number;
  xpToNextLevel: number;
  levelProgress: number;
  rewardEvent: RewardEvent | null;
  addFoodLog: (log: Omit<FoodLog, "id" | "date">) => void;
  completeWorkout: (session: Omit<WorkoutSession, "id" | "date">) => void;
  dismissReward: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const todayKey = () => new Date().toISOString().slice(0, 10);

const dayNumber = (date: string) => {
  const parsed = new Date(`${date}T12:00:00Z`);
  return Math.floor(parsed.getTime() / 86_400_000);
};

const daysBetween = (from: string, to: string) => dayNumber(to) - dayNumber(from);

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const xpNeededForLevel = (level: number) => 200 + (level - 1) * 90;

export const xpAtLevelStart = (level: number) => {
  let total = 0;
  for (let index = 1; index < level; index += 1) {
    total += xpNeededForLevel(index);
  }
  return total;
};

const levelFromXp = (xp: number) => {
  let level = 1;
  let remaining = xp;

  while (remaining >= xpNeededForLevel(level)) {
    remaining -= xpNeededForLevel(level);
    level += 1;
  }

  return level;
};

const questPool = (date: string): DailyQuest[] => [
  {
    id: `${date}-protein-100`,
    type: "protein",
    title: "Log 100g of protein",
    target: 100,
    progress: 0,
    reward: QUEST_REWARD,
    completed: false,
  },
  {
    id: `${date}-calorie-budget`,
    type: "calories",
    title: "Stay within your calorie budget",
    target: 1,
    progress: 0,
    reward: QUEST_REWARD,
    completed: false,
  },
  {
    id: `${date}-meal-count`,
    type: "meal_count",
    title: "Log 3 nutrition entries",
    target: 3,
    progress: 0,
    reward: QUEST_REWARD,
    completed: false,
  },
  {
    id: `${date}-upper-workout`,
    type: "workout_category",
    title: "Complete an Upper Body workout",
    target: 1,
    progress: 0,
    reward: QUEST_REWARD,
    category: "Upper Body",
    completed: false,
  },
  {
    id: `${date}-pull-workout`,
    type: "workout_category",
    title: "Complete a Back/Biceps workout",
    target: 1,
    progress: 0,
    reward: QUEST_REWARD,
    category: "Back/Biceps",
    completed: false,
  },
  {
    id: `${date}-lower-workout`,
    type: "workout_category",
    title: "Complete a Lower Body workout",
    target: 1,
    progress: 0,
    reward: QUEST_REWARD,
    category: "Lower Body",
    completed: false,
  },
  {
    id: `${date}-any-workout`,
    type: "workout_any",
    title: "Finish any planned workout",
    target: 1,
    progress: 0,
    reward: QUEST_REWARD,
    completed: false,
  },
];

const generateDailyQuests = (date: string) =>
  [...questPool(date)]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((quest) => ({ ...quest, id: uid(quest.id) }));

const defaultState = (date: string): AppState => ({
  xp: 0,
  level: 1,
  streak: 1,
  lastActiveDate: date,
  questDate: date,
  dailyQuests: generateDailyQuests(date),
  foodLogs: [],
  workoutHistory: [],
  macroBonusDates: [],
});

const parseStoredState = (date: string): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState(date);
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...defaultState(date),
      ...parsed,
      level: levelFromXp(parsed.xp ?? 0),
      dailyQuests: Array.isArray(parsed.dailyQuests) ? parsed.dailyQuests : generateDailyQuests(date),
      foodLogs: Array.isArray(parsed.foodLogs) ? parsed.foodLogs : [],
      workoutHistory: Array.isArray(parsed.workoutHistory) ? parsed.workoutHistory : [],
      macroBonusDates: Array.isArray(parsed.macroBonusDates) ? parsed.macroBonusDates : [],
    };
  } catch {
    return defaultState(date);
  }
};

const prepareForToday = (state: AppState, date: string): AppState => {
  const streak = daysBetween(state.lastActiveDate, date) > 1 ? 0 : state.streak;

  if (state.questDate !== date) {
    return {
      ...state,
      streak,
      questDate: date,
      dailyQuests: generateDailyQuests(date),
    };
  }

  return { ...state, streak };
};

const touchActivity = (state: AppState, date: string): AppState => {
  const gap = daysBetween(state.lastActiveDate, date);

  if (gap === 0) {
    return state;
  }

  return {
    ...state,
    lastActiveDate: date,
    streak: gap === 1 ? state.streak + 1 : 1,
  };
};

const totalsForDate = (logs: FoodLog[], date: string) =>
  logs
    .filter((log) => log.date === date)
    .reduce((total, log) => addMacros(total, log.macros), emptyMacros());

const workoutsForDate = (sessions: WorkoutSession[], date: string) =>
  sessions.filter((session) => session.date === date);

const isWithinFivePercent = (value: number, target: number) => {
  if (target === 0) {
    return value === 0;
  }

  return Math.abs(value - target) / target <= 0.05;
};

const recalculateQuestProgress = (state: AppState, date: string) => {
  const macros = totalsForDate(state.foodLogs, date);
  const logs = state.foodLogs.filter((log) => log.date === date);
  const workouts = workoutsForDate(state.workoutHistory, date);
  let questXp = 0;
  const completedTitles: string[] = [];

  const dailyQuests = state.dailyQuests.map((quest) => {
    let progress = 0;

    if (quest.type === "protein") {
      progress = macros.protein;
    }

    if (quest.type === "calories") {
      progress = logs.length > 0 && macros.calories <= DAILY_TARGETS.calories ? 1 : 0;
    }

    if (quest.type === "meal_count") {
      progress = logs.length;
    }

    if (quest.type === "workout_category") {
      progress = workouts.filter((workout) => workout.category === quest.category).length;
    }

    if (quest.type === "workout_any") {
      progress = workouts.length;
    }

    const completed = quest.completed || progress >= quest.target;

    if (!quest.completed && completed) {
      questXp += quest.reward;
      completedTitles.push(quest.title);
    }

    return {
      ...quest,
      progress: Math.min(progress, quest.target),
      completed,
    };
  });

  return {
    state: { ...state, dailyQuests },
    questXp,
    completedTitles,
  };
};

const withXp = (state: AppState, gained: number) => {
  if (gained <= 0) {
    return { state, leveledUp: false };
  }

  const xp = state.xp + gained;
  const nextLevel = levelFromXp(xp);

  return {
    state: { ...state, xp, level: nextLevel },
    leveledUp: nextLevel > state.level,
  };
};

const makeReward = (
  title: string,
  details: string[],
  xpGained: number,
  state: AppState,
  leveledUp: boolean,
): RewardEvent => ({
  id: uid("reward"),
  title,
  description: details.filter(Boolean).join(" "),
  xpGained,
  leveledUp,
  level: state.level,
});

export function AppProvider({ children }: PropsWithChildren) {
  const today = todayKey();
  const [state, setState] = useState<AppState>(() => prepareForToday(parseStoredState(today), today));
  const [rewardEvent, setRewardEvent] = useState<RewardEvent | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const runRewardingUpdate = useCallback(
    (
      action: (current: AppState) => AppState,
      baseXp: number,
      title: string,
      details: string[],
    ) => {
      let reward: RewardEvent | null = null;

      setState((current) => {
        const date = todayKey();
        let next = prepareForToday(current, date);
        next = touchActivity(next, date);
        next = action(next);

        const macros = totalsForDate(next.foodLogs, date);
        const hitMacros =
          isWithinFivePercent(macros.calories, DAILY_TARGETS.calories) &&
          isWithinFivePercent(macros.protein, DAILY_TARGETS.protein) &&
          isWithinFivePercent(macros.carbs, DAILY_TARGETS.carbs) &&
          isWithinFivePercent(macros.fats, DAILY_TARGETS.fats);

        let macroXp = 0;
        if (hitMacros && !next.macroBonusDates.includes(date)) {
          next = { ...next, macroBonusDates: [...next.macroBonusDates, date] };
          macroXp = 20;
        }

        const questResult = recalculateQuestProgress(next, date);
        next = questResult.state;

        const gained = baseXp + macroXp + questResult.questXp;
        const xpResult = withXp(next, gained);
        next = xpResult.state;

        reward = makeReward(
          title,
          [
            ...details,
            macroXp > 0 ? "Perfect macro target bonus unlocked." : "",
            questResult.completedTitles.length > 0
              ? `Daily quest complete: ${questResult.completedTitles.join(", ")}.`
              : "",
          ],
          gained,
          next,
          xpResult.leveledUp,
        );

        return next;
      });

      window.setTimeout(() => {
        if (reward) {
          setRewardEvent(reward);
        }
      }, 0);
    },
    [],
  );

  const addFoodLog = useCallback(
    (log: Omit<FoodLog, "id" | "date">) => {
      runRewardingUpdate(
        (current) => ({
          ...current,
          foodLogs: [
            {
              ...log,
              id: uid("food"),
              date: todayKey(),
            },
            ...current.foodLogs,
          ],
        }),
        10,
        "Meal logged",
        [`${log.name} added to today's nutrition log.`],
      );
    },
    [runRewardingUpdate],
  );

  const completeWorkout = useCallback(
    (session: Omit<WorkoutSession, "id" | "date">) => {
      runRewardingUpdate(
        (current) => ({
          ...current,
          workoutHistory: [
            {
              ...session,
              id: uid("workout"),
              date: todayKey(),
            },
            ...current.workoutHistory,
          ],
        }),
        50,
        "Workout complete!",
        [
          `${session.routineName} finished in ${Math.max(1, Math.round(session.durationSeconds / 60))} min.`,
          `${Math.round(session.totalVolume).toLocaleString()} lb total volume lifted.`,
        ],
      );
    },
    [runRewardingUpdate],
  );

  const todaysFoodLogs = useMemo(
    () => state.foodLogs.filter((log) => log.date === today),
    [state.foodLogs, today],
  );
  const todaysMacros = useMemo(() => totalsForDate(state.foodLogs, today), [state.foodLogs, today]);
  const todaysWorkouts = useMemo(
    () => workoutsForDate(state.workoutHistory, today),
    [state.workoutHistory, today],
  );
  const xpForCurrentLevel = Math.max(0, state.xp - xpAtLevelStart(state.level));
  const xpToNextLevel = xpNeededForLevel(state.level);
  const levelProgress = Math.min(100, (xpForCurrentLevel / xpToNextLevel) * 100);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      today,
      targets: DAILY_TARGETS,
      todaysFoodLogs,
      todaysMacros,
      todaysWorkouts,
      xpForCurrentLevel,
      xpToNextLevel,
      levelProgress,
      rewardEvent,
      addFoodLog,
      completeWorkout,
      dismissReward: () => setRewardEvent(null),
    }),
    [
      addFoodLog,
      completeWorkout,
      levelProgress,
      rewardEvent,
      state,
      today,
      todaysFoodLogs,
      todaysMacros,
      todaysWorkouts,
      xpForCurrentLevel,
      xpToNextLevel,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
};
