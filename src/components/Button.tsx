import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "secondary" | "danger" | "ghost" };

export function Button({ children, variant = "primary", className, ...props }: Props) {
  return <button className={cn("button", `button-${variant}`, className)} {...props}>{children}</button>;
}
