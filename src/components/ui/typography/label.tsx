import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-sm font-medium mb-2 block", className)}
      {...props}
    >
      {children}
    </label>
  );
}
