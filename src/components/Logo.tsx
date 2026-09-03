import logo from "@/assets/syncearn-logo.png";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = 36,
  withText = true,
}: {
  className?: string;
  size?: number;
  withText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src={logo}
        alt="SyncEarn logo"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="drop-shadow-[0_0_12px_oklch(0.75_0.19_146_/_45%)]"
      />
      {withText && (
        <span className="font-display text-xl font-bold tracking-tight">
          Sync<span className="text-gradient-money">Earn</span>
        </span>
      )}
    </span>
  );
}
