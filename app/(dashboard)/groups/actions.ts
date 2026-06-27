"use server";

import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function joinServerAction(serverId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const existing = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId, userId: session.user.id } },
  });

  if (!existing) {
    await prisma.serverMember.create({ data: { serverId, userId: session.user.id } });
  }

  const firstChannel = await prisma.channel.findFirst({ where: { serverId }, orderBy: { createdAt: "asc" } });
  redirect(firstChannel ? `/groups/${serverId}/${firstChannel.id}` : "/groups");
}
