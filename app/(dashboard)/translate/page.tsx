import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { TranslateClient } from "./translate-client";

export default async function TranslatePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { vipLevel: true },
  });

  const isVip = user?.vipLevel !== "FREE";

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const dailyUsed = isVip
    ? 0
    : await prisma.translateHistory.count({
        where: { userId: session.user.id, createdAt: { gte: startOfDay } },
      });

  return <TranslateClient dailyUsed={dailyUsed} isVip={isVip} />;
}
