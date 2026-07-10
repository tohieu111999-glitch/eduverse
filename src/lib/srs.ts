// Simplified SM-2 spaced-repetition scheduler (the algorithm behind Anki).
export type Quality = 0 | 3 | 4 | 5; // Quên · Khó · Tốt · Dễ

export const QUALITY_LABELS: { value: Quality; label: string; color: string }[] = [
  { value: 0, label: "Quên", color: "text-red-400 border-red-400/30 bg-red-500/10 hover:bg-red-500/20" },
  { value: 3, label: "Khó", color: "text-orange-400 border-orange-400/30 bg-orange-500/10 hover:bg-orange-500/20" },
  { value: 4, label: "Bình thường", color: "text-blue-400 border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/20" },
  { value: 5, label: "Dễ", color: "text-green-400 border-green-400/30 bg-green-500/10 hover:bg-green-500/20" },
];

export function scheduleNextReview(
  state: { easeFactor: number; intervalDays: number; repetitions: number },
  quality: Quality,
) {
  let { easeFactor, intervalDays, repetitions } = state;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, dueAt };
}
