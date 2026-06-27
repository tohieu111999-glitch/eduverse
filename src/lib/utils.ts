import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LEVEL_TITLES: [number, string][] = [
  [100, "Huyền Thoại"],
  [50, "Học Giả"],
  [20, "Chuyên Gia"],
  [10, "Học Viên"],
  [1, "Người Mới"],
];

export function levelTitle(level: number) {
  return LEVEL_TITLES.find(([min]) => level >= min)?.[1] ?? "Người Mới";
}

export function expForLevel(level: number) {
  return level * 100;
}
