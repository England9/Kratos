import { Check, Clock3, Dumbbell, Flame, Play, RotateCcw, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { WORKOUT_ROUTINES } from "../data/workouts";
import { useApp } from "../context/AppContext";
import type { WorkoutExerciseLog, WorkoutRoutine, WorkoutSetLog } from "../types/app";

type ActiveSession = {
  routine: WorkoutRoutine;
  startedAt: number;
  elapsedSeconds: number;
  exercises: WorkoutExerciseLog[];
};

const firstRepTarget = (target: string) => {
  const match = target.match(/\d+/);
  return match ? Number(match[0]) : 10;
};

const buildExercises = (routine: WorkoutRoutine): WorkoutExerciseLog[] =>
  routine.exercises.map((exercise) => ({
    name: exercise.name,
    targetSets: exercise.sets,
    targetReps: exercise.reps,
    sets: Array.from({ length: exercise.sets }, (): WorkoutSetLog => ({
      reps: firstRepTarget(exercise.reps),
      weight: 0,
      completed: false,
    })),
  }));

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
};

const sessionVolume = (exercises: WorkoutExerciseLog[]) =>
  exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.reduce((setTotal, set) => setTotal + (set.completed ? set.reps * set.weight : 0), 0),
    0,
  );

export function Fitness() {
  const { completeWorkout, state } = useApp();
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [pulseSet, setPulseSet] = useState<string | null>(null);
  const activeStartedAt = active?.startedAt;

  useEffect(() => {
    if (!activeStartedAt) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActive((current) =>
        current
          ? {
              ...current,
              elapsedSeconds: Math.floor((Date.now() - current.startedAt) / 1000),
            }
          : current,
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeStartedAt]);

  const activeVolume = useMemo(() => (active ? sessionVolume(active.exercises) : 0), [active]);
  const completedSets = useMemo(
    () => active?.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.completed).length ?? 0,
    [active],
  );
  const totalSets = useMemo(
    () => active?.exercises.flatMap((exercise) => exercise.sets).length ?? 0,
    [active],
  );

  const startRoutine = (routine: WorkoutRoutine) => {
    setActive({
      routine,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      exercises: buildExercises(routine),
    });
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    patch: Partial<WorkoutSetLog>,
  ) => {
    setActive((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.map((exercise, currentExerciseIndex) =>
          currentExerciseIndex === exerciseIndex
            ? {
                ...exercise,
                sets: exercise.sets.map((set, currentSetIndex) =>
                  currentSetIndex === setIndex ? { ...set, ...patch } : set,
                ),
              }
            : exercise,
        ),
      };
    });
  };

  const toggleSet = (exerciseIndex: number, setIndex: number, completed: boolean) => {
    updateSet(exerciseIndex, setIndex, { completed });

    if (completed) {
      const id = `${exerciseIndex}-${setIndex}`;
      setPulseSet(id);
      window.setTimeout(() => setPulseSet(null), 420);
    }
  };

  const finishWorkout = () => {
    if (!active) {
      return;
    }

    completeWorkout({
      routineId: active.routine.id,
      routineName: active.routine.name,
      category: active.routine.category,
      durationSeconds: Math.max(active.elapsedSeconds, 1),
      totalVolume: activeVolume,
      exercises: active.exercises,
    });
    setActive(null);
  };

  if (active) {
    return (
      <div className="space-y-5">
        <section className="sticky top-3 z-20 rounded-[2rem] border border-white/10 bg-zinc-950/90 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-sm font-bold text-lime-200">
                <Flame className="h-4 w-4" />
                Active session
              </div>
              <h1 className="text-3xl font-black sm:text-5xl">{active.routine.name}</h1>
              <p className="mt-2 text-zinc-400">{active.routine.summary}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[26rem]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                <Clock3 className="mx-auto mb-1 h-5 w-5 text-cyan-300" />
                <p className="text-xl font-black">{formatDuration(active.elapsedSeconds)}</p>
                <p className="text-xs font-bold text-zinc-500">timer</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                <Check className="mx-auto mb-1 h-5 w-5 text-lime-300" />
                <p className="text-xl font-black">
                  {completedSets}/{totalSets}
                </p>
                <p className="text-xs font-bold text-zinc-500">sets</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                <Dumbbell className="mx-auto mb-1 h-5 w-5 text-violet-300" />
                <p className="text-xl font-black">{Math.round(activeVolume).toLocaleString()}</p>
                <p className="text-xs font-bold text-zinc-500">volume</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {active.exercises.map((exercise, exerciseIndex) => (
            <div
              key={exercise.name}
              className="rounded-[2rem] border border-white/10 bg-zinc-950/75 p-4 shadow-xl shadow-black/20 sm:p-5"
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black">{exercise.name}</h2>
                  <p className="text-sm font-semibold text-zinc-500">
                    Target: {exercise.targetSets} sets x {exercise.targetReps} reps
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-sm font-bold text-zinc-400">
                  {exercise.sets.filter((set) => set.completed).length}/{exercise.sets.length} complete
                </span>
              </div>

              <div className="space-y-3">
                {exercise.sets.map((set, setIndex) => {
                  const id = `${exerciseIndex}-${setIndex}`;
                  return (
                    <div
                      key={id}
                      className={`grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 rounded-2xl border p-3 transition-all duration-300 ${
                        set.completed
                          ? "border-lime-300/30 bg-lime-300/10"
                          : "border-white/10 bg-white/[0.03]"
                      } ${pulseSet === id ? "animate-set-pop" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSet(exerciseIndex, setIndex, !set.completed)}
                        className={`grid h-11 w-11 place-items-center rounded-2xl border transition-all duration-300 ${
                          set.completed
                            ? "border-lime-300 bg-lime-300 text-black shadow-[0_0_22px_rgba(190,242,100,0.35)]"
                            : "border-white/10 bg-zinc-900 text-zinc-500 hover:border-lime-300/40"
                        }`}
                        aria-label={`Toggle set ${setIndex + 1}`}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                          Reps
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={set.reps}
                          onChange={(event) =>
                            updateSet(exerciseIndex, setIndex, { reps: Number(event.target.value) })
                          }
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 font-black text-white outline-none transition-all duration-300 focus:border-lime-300/50"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                          Weight
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={set.weight}
                          onChange={(event) =>
                            updateSet(exerciseIndex, setIndex, { weight: Number(event.target.value) })
                          }
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 font-black text-white outline-none transition-all duration-300 focus:border-lime-300/50"
                        />
                      </label>
                      <div className="hidden text-right text-sm font-bold text-zinc-500 sm:block">
                        Set {setIndex + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setActive(null)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-black text-zinc-300 transition-all duration-300 hover:border-white/20 hover:text-white"
          >
            <RotateCcw className="h-5 w-5" />
            Exit session
          </button>
          <button
            type="button"
            onClick={finishWorkout}
            className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-lime-300 px-5 py-4 font-black text-black shadow-[0_0_28px_rgba(190,242,100,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-lime-200"
          >
            <Trophy className="h-5 w-5" />
            Finish Workout (+50 XP)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-sm font-bold text-violet-200">
              <Dumbbell className="h-4 w-4" />
              Workout tracker
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Choose your mission</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Start a pre-planned routine, check off every set, and cash in XP when the workout is complete.
            </p>
          </div>
          <div className="rounded-2xl border border-lime-300/20 bg-lime-300/10 px-4 py-3 text-sm font-bold text-lime-100">
            +50 XP per completion
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {WORKOUT_ROUTINES.map((routine) => (
          <article
            key={routine.id}
            className="group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/75 p-5 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
          >
            <div className={`mb-5 h-2 rounded-full bg-gradient-to-r ${routine.accent}`} />
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-zinc-500">{routine.category}</p>
                <h2 className="mt-1 text-3xl font-black">{routine.name}</h2>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 transition-all duration-300 group-hover:border-lime-300/30 group-hover:text-lime-200">
                <Dumbbell className="h-6 w-6" />
              </div>
            </div>
            <p className="mb-5 min-h-12 text-sm leading-6 text-zinc-400">{routine.summary}</p>
            <div className="mb-5 space-y-2">
              {routine.exercises.slice(0, 4).map((exercise) => (
                <div key={exercise.name} className="flex items-center justify-between rounded-xl bg-white/[0.035] px-3 py-2">
                  <span className="text-sm font-bold text-zinc-300">{exercise.name}</span>
                  <span className="text-xs font-black text-zinc-500">
                    {exercise.sets} x {exercise.reps}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => startRoutine(routine)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-black text-black transition-all duration-300 hover:bg-lime-300 hover:shadow-[0_0_28px_rgba(190,242,100,0.28)]"
            >
              <Play className="h-5 w-5 fill-current" />
              Start routine
            </button>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-zinc-950/75 p-5 shadow-xl shadow-black/20">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-zinc-500">History</p>
            <h2 className="text-2xl font-black">Completed sessions</h2>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-sm font-bold text-zinc-400">
            {state.workoutHistory.length} total
          </span>
        </div>

        <div className="space-y-3">
          {state.workoutHistory.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
              Finish a routine to build your training history.
            </div>
          ) : (
            state.workoutHistory.slice(0, 6).map((session) => (
              <div
                key={session.id}
                className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <p className="text-lg font-black">{session.routineName}</p>
                  <p className="text-sm font-semibold text-zinc-500">{session.date}</p>
                </div>
                <div className="rounded-2xl bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100">
                  {formatDuration(session.durationSeconds)}
                </div>
                <div className="rounded-2xl bg-lime-300/10 px-4 py-3 text-sm font-black text-lime-100">
                  {Math.round(session.totalVolume).toLocaleString()} lb
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
