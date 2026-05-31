import { cn } from "@/lib/utils";

type TemaroLogoProps = {
  className?: string;
  markClassName?: string;
  showText?: boolean;
  textClassName?: string;
};

export function TemaroLogo({
  className,
  markClassName,
  showText = true,
  textClassName,
}: TemaroLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-sm",
          markClassName,
        )}
        aria-hidden="true"
      >
        <span className="absolute right-1 top-1 h-2 w-5 rounded-full bg-info" />
        <span className="absolute bottom-1 left-1 h-5 w-2 rounded-full bg-primary-foreground/20" />
        <svg
          viewBox="0 0 40 40"
          className="relative size-6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 12H30"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M15 12V29"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M21 26L25 30L32 20"
            stroke="oklch(0.68 0.145 246)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showText ? (
        <span
          className={cn(
            "text-sm font-extrabold tracking-[-0.035em] text-foreground",
            textClassName,
          )}
        >
          Temaro
        </span>
      ) : null}
    </div>
  );
}
