import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BANGKOK_TZ = "Asia/Bangkok";

/** Returns the current date components in Bangkok time (month is 0-indexed). */
export function getBangkokNow(): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BANGKOK_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => Number.parseInt(parts.find((p) => p.type === type)!.value);
  return { year: get("year"), month: get("month") - 1, day: get("day") };
}

/** Returns YYYY-MM-DD strings for the start and end of the current month in Bangkok time. */
export function getBangkokMonthRange(): { from: string; to: string } {
  const { year, month } = getBangkokNow();
  const pad = (n: number) => String(n).padStart(2, "0");
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    from: `${year}-${pad(month + 1)}-01`,
    to:   `${year}-${pad(month + 1)}-${pad(lastDay)}`,
  };
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BANGKOK_TZ,
    year: "numeric", month: "short", day: "numeric",
  }).format(d);
}
