import type { WorkoutRoutine } from "../types/app";

export const WORKOUT_ROUTINES: WorkoutRoutine[] = [
  {
    id: "push",
    name: "Push",
    category: "Upper Body",
    accent: "from-lime-400 to-emerald-500",
    summary: "Chest, shoulders, and triceps with progressive compound lifts.",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "6-8", guidance: "Drive feet into the floor and pause each rep." },
      { name: "Incline Dumbbell Press", sets: 3, reps: "8-10", guidance: "Keep shoulder blades pinned and control the eccentric." },
      { name: "Seated Shoulder Press", sets: 3, reps: "8-10", guidance: "Brace hard and avoid flaring the rib cage." },
      { name: "Cable Lateral Raise", sets: 3, reps: "12-15", guidance: "Lead with elbows and keep constant tension." },
      { name: "Rope Triceps Pressdown", sets: 3, reps: "10-12", guidance: "Split the rope at the bottom for a hard lockout." },
    ],
  },
  {
    id: "pull",
    name: "Pull",
    category: "Back/Biceps",
    accent: "from-cyan-300 to-blue-500",
    summary: "Back width, rows, rear delts, and biceps with clean volume.",
    exercises: [
      { name: "Weighted Pull-Up", sets: 4, reps: "5-8", guidance: "Start from a dead hang and finish chest tall." },
      { name: "Barbell Row", sets: 4, reps: "6-8", guidance: "Hinge strong and pull toward the lower ribs." },
      { name: "Lat Pulldown", sets: 3, reps: "10-12", guidance: "Keep elbows tucked and stretch fully at the top." },
      { name: "Face Pull", sets: 3, reps: "12-15", guidance: "Pull toward eyebrows and externally rotate." },
      { name: "Dumbbell Curl", sets: 3, reps: "10-12", guidance: "Avoid swinging and squeeze the peak contraction." },
    ],
  },
  {
    id: "legs",
    name: "Legs",
    category: "Lower Body",
    accent: "from-fuchsia-400 to-violet-500",
    summary: "Quads, hamstrings, glutes, and calves in a balanced lower session.",
    exercises: [
      { name: "Back Squat", sets: 4, reps: "5-8", guidance: "Brace before descent and drive through mid-foot." },
      { name: "Romanian Deadlift", sets: 4, reps: "8-10", guidance: "Push hips back and keep lats locked." },
      { name: "Leg Press", sets: 3, reps: "10-12", guidance: "Use deep range without letting hips curl up." },
      { name: "Walking Lunge", sets: 3, reps: "10 each", guidance: "Step long enough to keep front knee stacked." },
      { name: "Standing Calf Raise", sets: 4, reps: "12-15", guidance: "Pause at stretch and peak contraction." },
    ],
  },
];
