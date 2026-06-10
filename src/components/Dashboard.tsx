import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Crown, Flame, ShieldCheck, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { addMacros, emptyMacros } from "../data/foods";
import { useApp } from "../context/AppContext";
import type { MacroTotals } from "../types/app";

const formatNumber = (value: number) => Math.round(value).toLocaleString();

const Ring = ({
  label,
  value,
  target,
  color,
  radius,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  radius: number;
}) => {
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, value / target);

  return (
    <g>
      <circle
        cx="110"
        cy="110"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="12"
      />
      <circle
        cx="110"
        cy="110"
        r={radius}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="12"
        style={{
          strokeDasharray: `${circumference * progress} ${circumference}`,
          transform: "rotate(-90deg)",
          transformOrigin: "110px 110px",
          transition: "stroke-dasharray 600ms ease",
        }}
      />
      <text x="110" y={218 - radius / 2} textAnchor="middle" className="fill-zinc-400 text-[9px] font-bold">
        {label}
      </text>
    </g>
  );
};

function MacroRing({ macros, targets }: { macros: MacroTotals; targets: MacroTotals }) {
  return (
    <div className="relative mx-auto h-[240px] w-[240px]">
      <svg viewBox="0 0 220 220" className="h-full w-full drop-shadow-[0_0_28px_rgba(163,230,53,0.16)]">
        <Ring label="CAL" value={macros.calories} target={targets.calories} color="#bef264" radius={88} />
        <Ring label="PRO" value={macros.protein} target={targets.protein} color="#22d3ee" radius={68} />
        <Ring label="CARB" value={macros.carbs} target={targets.carbs} color="#a78bfa" radius={48} />
        <Ring label="FAT" value={macros.fats} target={targets.fats} color="#fb7185" radius={28} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-4xl font-black tracking-tighter">{formatNumber(macros.calories)}</p>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">calories</p>
        </div>
      </div>
    </div>
  );
}

function QuestRow({ title, progress, target, completed }: { title: string; progress: number; target: number; completed: boolean }) {
  const percent = Math.min(100, (progress / target) * 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-lime-300/30">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-white">{title}</p>
          <p className="text-sm text-zinc-500">
            {Math.round(progress)} / {target}
          </p>
        </div>
        <div
          className={`grid h-9 w-9 place-items-center rounded-xl border ${
            completed
              ? "border-lime-300/40 bg-lime-300 text-black"
              : "border-white/10 bg-zinc-900 text-zinc-500"
          }`}
        >
          {completed ? <ShieldCheck className="h-5 w-5" /> : <Target className="h-5 w-5" />}
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const chartDateLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3);

export function Dashboard() {
  const {
    state,
    targets,
    todaysMacros,
    todaysFoodLogs,
    todaysWorkouts,
    xpForCurrentLevel,
    xpToNextLevel,
    levelProgress,
  } = useApp();

  const chartData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const macros = state.foodLogs
      .filter((log) => log.date === key)
      .reduce((total, log) => addMacros(total, log.macros), emptyMacros());

    return {
      day: chartDateLabel(date),
      calories: Math.round(macros.calories),
      protein: Math.round(macros.protein),
    };
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-5 shadow-2xl shadow-black/30 sm:p-7">
          <div className="flex flex-col justify-between gap-6 sm:flex-row">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-sm font-bold text-lime-200">
                <Sparkles className="h-4 w-4" />
                Daily command center
              </div>
              <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-6xl">
                Build the streak. Feed the engine.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
                Complete quests, hit macro targets, and finish structured workouts to climb levels.
              </p>
            </div>

            <MacroRing macros={todaysMacros} targets={targets} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-[1.7rem] border border-orange-300/20 bg-orange-400/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <Flame className="h-7 w-7 text-orange-300" />
              <span className="rounded-full bg-orange-300 px-3 py-1 text-xs font-black text-black">LIVE</span>
            </div>
            <p className="text-4xl font-black">{state.streak}</p>
            <p className="text-sm font-semibold text-orange-100/80">day streak</p>
          </div>
          <div className="rounded-[1.7rem] border border-lime-300/20 bg-lime-300/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <Crown className="h-7 w-7 text-lime-300" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-lime-200">Level</span>
            </div>
            <p className="text-4xl font-black">{state.level}</p>
            <p className="text-sm font-semibold text-zinc-400">{formatNumber(state.xp)} total XP</p>
          </div>
          <div className="rounded-[1.7rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <Zap className="h-7 w-7 text-cyan-300" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Today</span>
            </div>
            <p className="text-4xl font-black">{todaysFoodLogs.length + todaysWorkouts.length}</p>
            <p className="text-sm font-semibold text-zinc-400">logged actions</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-zinc-500">Level progress</p>
              <h2 className="text-2xl font-black">XP to next level</h2>
            </div>
            <Trophy className="h-7 w-7 text-lime-300" />
          </div>
          <div className="mb-3 flex justify-between text-sm font-bold text-zinc-400">
            <span>{formatNumber(xpForCurrentLevel)} XP</span>
            <span>{formatNumber(xpToNextLevel)} XP</span>
          </div>
          <div className="h-5 overflow-hidden rounded-full border border-white/10 bg-zinc-900 p-1">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 shadow-[0_0_26px_rgba(190,242,100,0.45)] transition-all duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-zinc-500">Meals</p>
              <p className="text-2xl font-black">{todaysFoodLogs.length}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-zinc-500">Workouts</p>
              <p className="text-2xl font-black">{todaysWorkouts.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-zinc-500">Daily quests</p>
            <h2 className="text-2xl font-black">Earn bonus XP</h2>
          </div>
          <div className="grid gap-3">
            {state.dailyQuests.map((quest) => (
              <QuestRow key={quest.id} {...quest} />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-zinc-500">Tracking signal</p>
            <h2 className="text-2xl font-black">7-day nutrition trend</h2>
          </div>
          <p className="text-sm text-zinc-500">Calories with protein overlay</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="calories" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#bef264" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#bef264" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="protein" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#09090b",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />
              <Area type="monotone" dataKey="calories" stroke="#bef264" fill="url(#calories)" strokeWidth={3} />
              <Area type="monotone" dataKey="protein" stroke="#22d3ee" fill="url(#protein)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
