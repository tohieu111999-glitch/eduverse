// Simplified SM-2 spaced-repetition scheduler (the algorithm behind Anki).
export type Quality = 0 | 3 | 4 | 5; // Quên · Khó · Tốt · Dễ

export const QUALITY_LABELS: { value: Quality; label: string }[] = [
  { value: 0, label: "Quên" },
  { value: 3, label: "Khó" },
  { value: 4, label: "Tốt" },
  { value: 5, label: "Dễ" },
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
