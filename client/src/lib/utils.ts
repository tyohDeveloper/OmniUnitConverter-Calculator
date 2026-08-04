// EXCEPTION [architecture-standards §3.7]: shadcn/ui boilerplate. This
// file is the standard shadcn scaffold's `cn()` helper for merging
// Tailwind class names. The path `@/lib/utils` is the canonical import
// used by every shadcn component and by third-party shadcn snippets;
// renaming it away from `utils.ts` would fork the convention with no
// domain benefit (there is one function, and it does exactly what its
// name says).
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
