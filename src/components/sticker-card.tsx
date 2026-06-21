type StickerCardProps = {
  name: string;
  stats: string;
  team: string;
  watermark?: boolean;
  theme?: "gold" | "sky";
};

const THEMES = {
  gold: {
    wrapper: "bg-[radial-gradient(circle_at_top,#f9df63_0%,#d8ac14_26%,#9a7300_100%)]",
    foil:
      "bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.35),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.22),transparent_16%),radial-gradient(circle_at_72%_78%,rgba(255,255,255,0.20),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.15),transparent_32%,rgba(255,255,255,0.18)_56%,transparent_82%)]",
    twentySix: "text-[#0f7b34]/80",
    bottomBar: "bg-[#2f8d55]",
    clubBar: "bg-[#2f8d55]",
    sideLabel: "text-white/95",
    panelGlow: "bg-white/10",
  },
  sky: {
    wrapper: "bg-[linear-gradient(180deg,#83dfe7_0%,#43c6d0_100%)]",
    foil:
      "bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.36),transparent_14%),radial-gradient(circle_at_85%_16%,rgba(255,255,255,0.24),transparent_13%),linear-gradient(135deg,rgba(255,255,255,0.14),transparent_34%,rgba(255,255,255,0.16)_58%,transparent_86%)]",
    twentySix: "text-[#1b8c34]/55",
    bottomBar: "bg-[#2b7c8f]",
    clubBar: "bg-[#2d7d91]",
    sideLabel: "text-white/90",
    panelGlow: "bg-white/12",
  },
} as const;

export function StickerCard({
  name,
  stats,
  team,
  watermark = false,
  theme = "gold",
}: StickerCardProps) {
  const currentTheme = THEMES[theme];

  return (
    <div className="interactive-card group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-card">
      <div className={`relative aspect-[5/7] overflow-hidden rounded-[24px] ${currentTheme.wrapper}`}>
        <div className={`absolute inset-0 ${currentTheme.foil}`} />
        <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[linear-gradient(120deg,transparent_22%,rgba(255,255,255,0.28)_45%,transparent_68%)]" />
        <div
          className={`absolute left-3 top-8 font-display text-[6rem] leading-none sm:text-[7rem] ${currentTheme.twentySix}`}
        >
          26
        </div>
        <div
          className={`absolute left-3 top-40 font-display text-[6rem] leading-none sm:text-[7rem] ${currentTheme.twentySix}`}
        >
          26
        </div>
        <div className="absolute right-4 top-4 text-right text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)]">
          <div className="text-[1.65rem] leading-none">🏆</div>
          <p className="text-[11px] font-bold tracking-[0.25em]">FIFA</p>
          <p className="text-2xl font-black">26</p>
        </div>
        <div
          className={`absolute left-1/2 top-[17%] h-[55%] w-[65%] -translate-x-1/2 overflow-hidden rounded-[24px] border border-white/25 ${currentTheme.panelGlow}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_54%)]" />
          <div className="absolute left-1/2 top-[9%] h-[25%] w-[28%] -translate-x-1/2 rounded-b-[38%] rounded-t-[48%] bg-[linear-gradient(180deg,#d29d74_0%,#a16f4f_100%)] shadow-[0_20px_30px_rgba(0,0,0,0.15)]" />
          <div className="absolute left-1/2 top-[28%] h-[55%] w-[64%] -translate-x-1/2 rounded-t-[40%] rounded-b-[14%] bg-[linear-gradient(180deg,#ffd83f_0%,#f2c60a_60%,#c49d00_100%)] shadow-[0_25px_30px_rgba(0,0,0,0.12)]">
            <div className="absolute inset-x-[18%] top-0 h-[8%] rounded-b-full bg-[#12a14c]" />
            <div className="absolute inset-x-[30%] top-[11%] h-[18%] rounded-full bg-[radial-gradient(circle,#f8fffb_0%,#9fd0df_55%,#3b8ec6_100%)] opacity-95" />
            <div className="absolute left-1/2 top-[14%] h-[12%] w-[16%] -translate-x-1/2 rounded-full border border-[#f7f18d] bg-[linear-gradient(180deg,#ffe75a_0%,#d9b316_100%)]" />
            <div className="absolute inset-x-[8%] top-[18%] flex justify-center gap-1 text-[7px] text-[#ffd94e]">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>
            <div className="absolute left-[13%] top-[22%] h-[3%] w-[16%] rounded-full bg-[#00a04b]" />
            <div className="absolute inset-x-[18%] bottom-[9%] h-[8%] rounded-full bg-white/15" />
          </div>
        </div>
        <div className="absolute right-4 top-[35%] flex flex-col items-center gap-3">
          <div className="relative grid h-16 w-16 place-items-center rounded-full border-[3px] border-white/90 bg-brand-green shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
            <div className="h-8 w-8 rotate-45 bg-brand-yellow" />
            <div className="absolute h-4 w-4 rounded-full bg-brand-blue" />
          </div>
          <p className={`rotate-90 text-2xl font-display tracking-[0.22em] ${currentTheme.sideLabel}`}>
            BRASIL
          </p>
        </div>
        <div className="absolute inset-x-4 bottom-9 rounded-full border border-white/10 px-4 py-2 text-center text-white shadow-[0_14px_26px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:px-5">
          <div className={`${currentTheme.bottomBar} absolute inset-0 rounded-full`} />
          <div className="relative">
            <p className="font-display text-[1.75rem] uppercase tracking-[0.08em] leading-none">{name}</p>
            <p className="mt-1 text-[11px] font-semibold sm:text-xs">{stats}</p>
          </div>
        </div>
        <div className="absolute inset-x-7 bottom-3 rounded-full border border-white/10 px-4 py-1.5 text-center text-white shadow-[0_10px_22px_rgba(0,0,0,0.16)] backdrop-blur-sm">
          <div className={`${currentTheme.clubBar} absolute inset-0 rounded-full`} />
          <div className="relative flex items-center justify-between gap-3">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] sm:text-xs">{team}</p>
            <p className="rounded-sm bg-[#f2d34b] px-2 py-0.5 font-serif text-[11px] font-bold tracking-[0.16em] text-[#ab1b22]">
              PANINI
            </p>
          </div>
        </div>
        {watermark ? (
          <div className="absolute inset-0 grid place-items-center overflow-hidden">
            <div className="-rotate-[24deg] text-center text-sm font-black uppercase tracking-[0.45em] text-white/45 sm:text-lg">
              MINHA FIGURINHA 2026
              <br />
              MINHA FIGURINHA 2026
              <br />
              MINHA FIGURINHA 2026
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
