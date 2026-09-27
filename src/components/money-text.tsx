import { formatEGP } from "@/lib/money";
import { cn } from "@/lib/utils";

export function MoneyText({
  value,
  className,
  emphasize,
}: {
  value: string | number;
  className?: string;
  emphasize?: boolean;
}) {
  return (
    <span
      className={cn(
        "tabular",
        emphasize && "text-lg font-medium tracking-tight",
        className,
      )}
    >
      {formatEGP(value)}
    </span>
  );
}
