"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export type SettingsState = { error?: string; success?: boolean };

const DEFAULT_SETTINGS = {
  darkMode: false,
  reminderEnabled: false,
  reminderTimesPerDay: 3,
  reminderStartHour: 8,
  reminderEndHour: 21,
  reminderDays: [1, 2, 3, 4, 5, 6, 7],
  showHanViet: true,
  learningMode: "simplified",
  phoneticType: "pinyin",
  language: "vi",
  fontSize: 16,
  voiceGender: "auto",
  voiceSpeed: 1.0,
};

export async function saveUserSettingsAction(data: {
  darkMode: boolean;
  reminderEnabled: boolean;
  reminderTimesPerDay: number;
  reminderStartHour: number;
  reminderEndHour: number;
  reminderDays: number[];
  showHanViet: boolean;
  learningMode: string;
  phoneticType: string;
  language: string;
  fontSize: number;
  voiceGender: string;
  voiceSpeed: number;
}): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function resetUserSettingsAction(): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...DEFAULT_SETTINGS },
    update: DEFAULT_SETTINGS,
  });

  revalidatePath("/settings");
  return { success: true };
}
