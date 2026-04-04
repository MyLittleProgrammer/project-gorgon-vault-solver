import { cn } from "@/lib/utils";
import { SYMBOL_NAMES } from "@/lib/symbols";

interface SymbolButtonProps {
  symbolId: number;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg" | "responsive";
  disabled?: boolean;
  className?: string;
  dimmed?: boolean;
}

// Order: Laguz, Berkano, Perthro, Ansuz, Ingwaz, Ehwaz (top row)
//        Thurisaz, Othala, Sowilo, Naudiz, Dagaz, Gebo (bottom row)
const RUNE_CHARS: Record<number, string> = {
  0:  "ᛚ", // Laguz
  1:  "ᛒ", // Berkano
  2:  "ᛈ", // Perthro
  3:  "ᚨ", // Ansuz
  4:  "ᛜ", // Ingwaz
  5:  "ᛖ", // Ehwaz
  6:  "ᚦ", // Thurisaz
  7:  "ᛟ", // Othala
  8:  "ᛋ", // Sowilo
  9:  "ᚾ", // Naudiz
  10: "ᛞ", // Dagaz
  11: "ᚷ", // Gebo
};

const sizeClasses = {
  sm:         "w-10 h-10",
  md:         "w-14 h-14",
  lg:         "w-16 h-16",
  responsive: "w-10 h-10 md:w-14 md:h-14 xl:w-16 xl:h-16",
};

const textSizeClasses = {
  sm:         "text-2xl",
  md:         "text-3xl",
  lg:         "text-4xl",
  responsive: "text-2xl md:text-3xl xl:text-4xl",
};

export function SymbolButton({
  symbolId,
  selected = false,
  onClick,
  size = "md",
  disabled = false,
  className,
  dimmed = false,
}: SymbolButtonProps) {
  const label = SYMBOL_NAMES[symbolId] ?? `Symbol ${symbolId}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "relative flex items-center justify-center rounded-sm transition-all duration-150",
        sizeClasses[size],
        "border-2",
        selected
          ? "border-amber-500 bg-amber-950/60 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
          : "border-stone-600 bg-stone-800/80 text-stone-400",
        !disabled && !selected && "hover:border-amber-700 hover:text-amber-500 hover:bg-stone-700/80 cursor-pointer",
        disabled && "cursor-default",
        disabled && !selected && "opacity-50",
        dimmed && !selected && "opacity-30",
        className
      )}
    >
      <span
        className={cn("flex items-center justify-center w-full h-full leading-none select-none", textSizeClasses[size])}
      >
        {RUNE_CHARS[symbolId]}
      </span>
      {selected && (
        <div className="absolute inset-0 rounded-sm bg-amber-400/5 pointer-events-none" />
      )}
    </button>
  );
}

export function SymbolDisplay({
  symbolId,
  size = "sm",
  className,
}: {
  symbolId: number;
  size?: "sm" | "md" | "lg" | "responsive";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-sm border-2 border-stone-600 bg-stone-800/80 text-amber-500",
        sizeClasses[size],
        className
      )}
    >
      <span
        className={cn("flex items-center justify-center w-full h-full leading-none select-none", textSizeClasses[size])}
      >
        {RUNE_CHARS[symbolId]}
      </span>
    </div>
  );
}
