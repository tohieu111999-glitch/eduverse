import { prisma } from "@/src/lib/prisma";

export async function canViewQuiz(
  quiz: { ownerId: string; visibility: "PUBLIC" | "FRIENDS" | "PRIVATE" },
  viewerId: string,
): Promise<boolean> {
  if (quiz.ownerId === viewerId) return true;
  if (quiz.visibility === "PUBLIC") return true;
  if (quiz.visibility === "PRIVATE") return false;

  const [viewerFollowsOwner, ownerFollowsViewer] = await Promise.all([
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewerId, followingId: quiz.ownerId } },
    }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: quiz.ownerId, followingId: viewerId } },
    }),
  ]);
  return Boolean(viewerFollowsOwner && ownerFollowsViewer);
}

async function getMutualFollowIds(viewerId: string): Promise<string[]> {
  const [following, followers] = await Promise.all([
    prisma.follow.findMany({ where: { followerId: viewerId }, select: { followingId: true } }),
    prisma.follow.findMany({ where: { followingId: viewerId }, select: { followerId: true } }),
  ]);
  const followerIds = new Set(followers.map((f) => f.followerId));
  return following.map((f) => f.followingId).filter((id) => followerIds.has(id));
}

export async function visibleQuizWhereClause(viewerId: string) {
  const mutualIds = await getMutualFollowIds(viewerId);

  return {
    OR: [
      { ownerId: viewerId },
      { visibility: "PUBLIC" as const },
      { visibility: "FRIENDS" as const, ownerId: { in: mutualIds } },
    ],
  };
}
