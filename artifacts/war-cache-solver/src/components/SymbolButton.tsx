import { cn } from "@/lib/utils";
import { SYMBOL_NAMES } from "@/lib/symbols";

interface SymbolButtonProps {
  symbolId: number;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  dimmed?: boolean;
}

const SYMBOL_SVGS: Record<number, React.ReactNode> = {
  0: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 8 L14 32 M14 8 L22 16 M14 20 L20 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  1: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 8 L14 32 M14 8 L24 14 L14 20 M14 20 L24 26 L14 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  2: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 8 L14 32 M14 8 L26 8 C26 8 30 14 26 20 L14 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  3: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8 L20 20 L28 8 M12 32 L20 20 L28 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  4: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 8 L20 16 L26 8 M14 32 L20 24 L26 32 M14 8 L14 32 M26 8 L26 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  5: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 8 L26 32 M26 8 L14 32 M14 20 L26 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  6: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 8 L14 32 M14 32 L26 32 M14 20 L22 20 M14 8 L26 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  7: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 8 L14 32 M26 8 L26 32 M14 8 L26 20 M14 32 L26 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  8: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 20 L20 8 L28 20 L20 32 L12 20 M20 8 L20 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  9: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8 L20 32 M14 8 L26 20 M26 8 L14 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  10: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 8 L14 32 M26 8 L26 32 M14 8 L26 20 M14 20 L26 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  11: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8 L14 14 M20 8 L26 14 M14 32 L20 8 L26 32 M14 32 L26 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-16 h-16",
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
        disabled && "cursor-not-allowed opacity-50",
        dimmed && !selected && "opacity-30",
        className
      )}
    >
      <div className={cn("w-3/5 h-3/5 flex items-center justify-center")}>
        {SYMBOL_SVGS[symbolId]}
      </div>
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
  size?: "sm" | "md" | "lg";
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
      <div className="w-3/5 h-3/5 flex items-center justify-center">
        {SYMBOL_SVGS[symbolId]}
      </div>
    </div>
  );
}
