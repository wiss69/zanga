import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value);
}
