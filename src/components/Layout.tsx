import { Activity, Dumbbell, Flame, Home, Utensils } from "lucide-react";
import type { ReactNode } from "react";
import type { TabId } from "../types/app";
import { useApp } from "../context/AppContext";

type LayoutProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: ReactNode;
};

const navItems: Array<{ id: TabId; label: string; icon: typeof Home }> = [
  { id: "dashboard", label: "Hub", icon: Home },
  { id: "nutrition", label: "Nutrition", icon: Utensils },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
];

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-[#050607] text-zinc-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl md:pl-28">
        <aside className="fixed left-4 top-4 z-30 hidden h-[calc(100vh-2rem)] w-20 flex-col items-center justify-between rounded-[2rem] border border-white/10 bg-zinc-950/80 px-3 py-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:flex">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-lime-300/30 bg-lime-400/15 shadow-[0_0_30px_rgba(163,230,53,0.25)]">
            <Activity className="h-6 w-6 text-lime-300" />
          </div>

          <nav className="flex flex-col gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.id === activeTab;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`group relative grid h-14 w-14 place-items-center rounded-2xl border transition-all duration-300 ${
                    active
                      ? "border-lime-300/40 bg-lime-300 text-black shadow-[0_0_28px_rgba(190,242,100,0.35)]"
                      : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="h-5 w-5" />
                  <span className="pointer-events-none absolute left-16 rounded-xl border border-white/10 bg-zinc-950 px-3 py-1 text-xs font-semibold text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-orange-300/30 bg-orange-400/10 text-orange-300">
            <Flame className="h-5 w-5" />
            <span className="sr-only">{state.streak} day streak</span>
          </div>
        </aside>

        <main className="w-full px-4 pb-28 pt-5 sm:px-6 md:pb-10 md:pt-8 lg:px-8">{children}</main>
      </div>

      <nav className="fixed bottom-3 left-1/2 z-40 grid w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 grid-cols-3 gap-2 rounded-[1.6rem] border border-white/10 bg-zinc-950/90 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-bold transition-all duration-300 ${
                active
                  ? "bg-lime-300 text-black shadow-[0_0_24px_rgba(190,242,100,0.35)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
