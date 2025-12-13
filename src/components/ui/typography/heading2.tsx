import { cn } from "@/lib/utils";

export type Heading2Props = React.HTMLAttributes<HTMLHeadingElement>;

export function Heading2({ children, className, ...props }: Heading2Props) {
  return (
    <h2 className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </h2>
  );
}
