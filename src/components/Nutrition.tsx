import { Plus, Search, Sparkles, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { FOOD_LIBRARY, multiplyMacros } from "../data/foods";
import { useApp } from "../context/AppContext";
import type { MacroTotals } from "../types/app";

const macroMeta: Array<{ key: keyof MacroTotals; label: string; color: string; unit: string }> = [
  { key: "calories", label: "Calories", color: "from-lime-300 to-emerald-400", unit: "cal" },
  { key: "protein", label: "Protein", color: "from-cyan-300 to-blue-400", unit: "g" },
  { key: "carbs", label: "Carbs", color: "from-violet-300 to-fuchsia-400", unit: "g" },
  { key: "fats", label: "Fats", color: "from-rose-300 to-orange-400", unit: "g" },
];

const rounded = (value: number) => Math.round(value * 10) / 10;

function MacroBar({ label, value, target, color, unit }: { label: string; value: number; target: number; color: string; unit: string }) {
  const percent = Math.min(100, (value / target) * 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-zinc-400">{label}</p>
          <p className="text-2xl font-black">
            {rounded(value)}
            <span className="ml-1 text-sm font-bold text-zinc-500">{unit}</span>
          </p>
        </div>
        <p className="text-sm font-bold text-zinc-500">
          {Math.round(target)}
          {unit}
        </p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} shadow-[0_0_18px_rgba(190,242,100,0.22)] transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function Nutrition() {
  const { addFoodLog, targets, todaysFoodLogs, todaysMacros } = useApp();
  const [mode, setMode] = useState<"library" | "custom">("library");
  const [selectedFood, setSelectedFood] = useState(FOOD_LIBRARY[0].name);
  const [quantity, setQuantity] = useState(100);
  const [customName, setCustomName] = useState("");
  const [customMacros, setCustomMacros] = useState<MacroTotals>({
    calories: 320,
    protein: 25,
    carbs: 35,
    fats: 9,
  });

  const libraryFood = useMemo(
    () => FOOD_LIBRARY.find((food) => food.name === selectedFood) ?? FOOD_LIBRARY[0],
    [selectedFood],
  );

  const preview = mode === "library" ? multiplyMacros(libraryFood.macrosPerUnit, quantity) : customMacros;
  const servingLabel = mode === "library" ? libraryFood.servingLabel : "custom serving";

  const submit = () => {
    const name = mode === "library" ? libraryFood.name : customName.trim() || "Custom Food";
    addFoodLog({
      name,
      quantity: mode === "library" ? quantity : 1,
      servingLabel,
      macros: preview,
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">
              <Utensils className="h-4 w-4" />
              Food tracker
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Instant macro logging</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Pick a common food or add custom macros. Every meal earns XP and can complete daily quests.
            </p>
          </div>
          <div className="rounded-2xl border border-lime-300/20 bg-lime-300/10 px-4 py-3 text-sm font-bold text-lime-100">
            +10 XP per meal
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {macroMeta.map((macro) => (
            <MacroBar
              key={macro.key}
              label={macro.label}
              value={todaysMacros[macro.key]}
              target={targets[macro.key]}
              color={macro.color}
              unit={macro.unit}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-white/10 bg-zinc-950/75 p-5 shadow-xl shadow-black/20">
          <div className="mb-5 flex rounded-2xl border border-white/10 bg-black/30 p-1">
            {(["library", "custom"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-black capitalize transition-all duration-300 ${
                  mode === item ? "bg-lime-300 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {mode === "library" ? (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-400">Food lookup</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                  <select
                    value={selectedFood}
                    onChange={(event) => setSelectedFood(event.target.value)}
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-zinc-900 py-4 pl-12 pr-4 font-bold text-white outline-none transition-all duration-300 focus:border-lime-300/50"
                  >
                    {FOOD_LIBRARY.map((food) => (
                      <option key={food.name}>{food.name}</option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-400">
                  Quantity ({libraryFood.servingLabel})
                </span>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 font-bold text-white outline-none transition-all duration-300 focus:border-lime-300/50"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-400">Food name</span>
                <input
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                  placeholder="Custom bowl, shake, snack..."
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 font-bold text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-lime-300/50"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                {macroMeta.map((macro) => (
                  <label key={macro.key} className="block">
                    <span className="mb-2 block text-sm font-bold text-zinc-400">{macro.label}</span>
                    <input
                      type="number"
                      min="0"
                      value={customMacros[macro.key]}
                      onChange={(event) =>
                        setCustomMacros((current) => ({
                          ...current,
                          [macro.key]: Number(event.target.value),
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 font-bold text-white outline-none transition-all duration-300 focus:border-lime-300/50"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-lime-200">
              <Sparkles className="h-4 w-4" />
              Live macro preview
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              {macroMeta.map((macro) => (
                <div key={macro.key} className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-lg font-black">{rounded(preview[macro.key])}</p>
                  <p className="text-[0.65rem] font-bold uppercase text-zinc-500">{macro.label}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-300 px-5 py-4 font-black text-black shadow-[0_0_28px_rgba(190,242,100,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-lime-200"
          >
            <Plus className="h-5 w-5" />
            Log food
          </button>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-zinc-950/75 p-5 shadow-xl shadow-black/20">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-zinc-500">Daily log</p>
              <h2 className="text-2xl font-black">Today&apos;s fuel</h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-sm font-bold text-zinc-400">
              {todaysFoodLogs.length} items
            </span>
          </div>

          <div className="space-y-3">
            {todaysFoodLogs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
                No food logged yet. Add your first entry to start earning XP.
              </div>
            ) : (
              todaysFoodLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-lime-300/25"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-white">{log.name}</p>
                      <p className="text-sm font-semibold text-zinc-500">
                        {log.quantity} {log.servingLabel}
                      </p>
                    </div>
                    <p className="rounded-full bg-lime-300/10 px-3 py-1 text-sm font-black text-lime-200">
                      {Math.round(log.macros.calories)} cal
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="rounded-xl bg-cyan-300/10 px-3 py-2 font-bold text-cyan-100">
                      P {rounded(log.macros.protein)}g
                    </span>
                    <span className="rounded-xl bg-violet-300/10 px-3 py-2 font-bold text-violet-100">
                      C {rounded(log.macros.carbs)}g
                    </span>
                    <span className="rounded-xl bg-rose-300/10 px-3 py-2 font-bold text-rose-100">
                      F {rounded(log.macros.fats)}g
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
