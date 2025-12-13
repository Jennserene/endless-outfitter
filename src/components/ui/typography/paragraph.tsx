import { cn } from "@/lib/utils";

export type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;

export function Paragraph({ children, className, ...props }: ParagraphProps) {
  return (
    <p className={cn("leading-7 not-first:mt-6", className)} {...props}>
      {children}
    </p>
  );
}
