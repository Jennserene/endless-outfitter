import { cn } from "@/lib/utils";

export type Heading1Props = React.HTMLAttributes<HTMLHeadingElement>;

export function Heading1({ children, className, ...props }: Heading1Props) {
  return (
    <h1 className={cn("text-3xl font-bold mb-4", className)} {...props}>
      {children}
    </h1>
  );
}
