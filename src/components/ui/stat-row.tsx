import { Span } from "@/components/ui/typography";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface StatRowProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

export function StatRow({ label, value, unit, className }: StatRowProps) {
  const displayValue = typeof value === "number" ? formatNumber(value) : value;
  const fullValue = unit ? `${displayValue} ${unit}` : displayValue;

  return (
    <div className={cn("flex justify-between", className)}>
      <Span variant="muted">{label}:</Span>
      <Span variant="medium">{fullValue}</Span>
    </div>
  );
}
