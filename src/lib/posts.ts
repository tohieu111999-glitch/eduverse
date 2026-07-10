import { prisma } from "./prisma";

export async function getFeedPosts({
  authorId,
  currentUserId,
  tab = "all",
  take = 30,
}: {
  authorId?: string;
  currentUserId: string;
  tab?: "all" | "liked" | "pinned" | "following";
  take?: number;
}) {
  let where: Record<string, unknown> = authorId ? { authorId } : {};

  if (tab === "liked") {
    where = { ...where, likes: { some: { userId: currentUserId } } };
  } else if (tab === "pinned") {
    where = { ...where, isPinned: true };
  } else if (tab === "following") {
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const ids = following.map((f) => f.followingId);
    where = { ...where, authorId: { in: ids } };
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take,
    include: {
      author: { select: { id: true, displayName: true, username: true, avatar: true, level: true, vipLevel: true, vipExpiresAt: true } },
      likes: { where: { userId: currentUserId }, select: { id: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { displayName: true, username: true, avatar: true, vipLevel: true, vipExpiresAt: true } } },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return posts.map((post) => ({ ...post, likedByMe: post.likes.length > 0 }));
}

export type FeedPost = Awaited<ReturnType<typeof getFeedPosts>>[number];
