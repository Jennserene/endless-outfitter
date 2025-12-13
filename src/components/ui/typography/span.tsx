import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spanVariants = cva("", {
  variants: {
    variant: {
      default: "",
      muted: "text-muted-foreground",
      medium: "font-medium",
      "small-muted": "text-xs text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type SpanProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof spanVariants>;

export function Span({ children, variant, className, ...props }: SpanProps) {
  return (
    <span className={cn(spanVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

export { spanVariants };
