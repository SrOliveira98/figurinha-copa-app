import Image from "next/image";

type ExampleStickerImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  watermark?: boolean;
  className?: string;
};

export function ExampleStickerImage({
  src,
  alt,
  priority = false,
  watermark = false,
  className = "",
}: ExampleStickerImageProps) {
  return (
    <div
      className={`interactive-card group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-card ${className}`}
    >
      <div className="relative aspect-[5/8] overflow-hidden rounded-[24px] bg-slate-100">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_40%,rgba(255,255,255,0.08)_70%,transparent_100%)] opacity-70 transition duration-500 group-hover:opacity-100" />
        {watermark ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
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
