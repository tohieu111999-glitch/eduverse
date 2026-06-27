import { notFound, redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";

export default async function ServerRedirectPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;

  const firstChannel = await prisma.channel.findFirst({ where: { serverId }, orderBy: { createdAt: "asc" } });
  if (!firstChannel) notFound();

  redirect(`/groups/${serverId}/${firstChannel.id}`);
}
