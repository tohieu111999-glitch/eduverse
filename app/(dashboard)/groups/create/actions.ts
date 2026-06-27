"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { awardAchievement } from "@/src/lib/achievements";

const createServerSchema = z.object({
  name: z.string().trim().min(2, "Tên nhóm phải có ít nhất 2 ký tự").max(60, "Tên nhóm tối đa 60 ký tự"),
});

export type CreateServerState = { error?: string };

export async function createServerAction(_prevState: CreateServerState, formData: FormData): Promise<CreateServerState> {
  const session = await auth();
  if (!session?.user) return { error: "Bạn cần đăng nhập" };

  const parsed = createServerSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const server = await prisma.server.create({
    data: {
      name: parsed.data.name,
      ownerId: session.user.id,
      members: { create: { userId: session.user.id, role: "OWNER" } },
      channels: { create: { name: "general" } },
    },
    include: { channels: true },
  });

  await awardAchievement(session.user.id, "FIRST_SERVER");

  redirect(`/groups/${server.id}/${server.channels[0].id}`);
}
