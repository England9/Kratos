import { PartyPopper, Sparkles, Trophy, X } from "lucide-react";
import { useApp } from "../context/AppContext";

export function RewardModal() {
  const { rewardEvent, dismissReward, levelProgress } = useApp();

  if (!rewardEvent) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-lime-300/30 bg-zinc-950 p-6 text-center shadow-[0_0_70px_rgba(190,242,100,0.25)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-lime-300 to-fuchsia-300" />
        <button
          type="button"
          onClick={dismissReward}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition-all duration-300 hover:text-white"
          aria-label="Close reward"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-[1.7rem] border border-lime-300/30 bg-lime-300 text-black shadow-[0_0_38px_rgba(190,242,100,0.45)]">
          {rewardEvent.leveledUp ? <Trophy className="h-10 w-10" /> : <PartyPopper className="h-10 w-10" />}
        </div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm font-bold text-lime-200">
          <Sparkles className="h-4 w-4" />
          +{rewardEvent.xpGained} XP
        </div>
        <h2 className="text-3xl font-black">{rewardEvent.leveledUp ? "Level up!" : rewardEvent.title}</h2>
        <p className="mt-3 text-zinc-400">{rewardEvent.description}</p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex justify-between text-sm font-bold text-zinc-400">
            <span>Level {rewardEvent.level}</span>
            <span>{Math.round(levelProgress)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-300 to-cyan-300 transition-all duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={dismissReward}
          className="mt-6 w-full rounded-2xl bg-lime-300 px-5 py-4 font-black text-black transition-all duration-300 hover:bg-lime-200"
        >
          Keep grinding
        </button>
      </div>
    </div>
  );
}
