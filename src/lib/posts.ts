import { prisma } from "./prisma";

export async function getFeedPosts({
  authorId,
  currentUserId,
  take = 20,
}: {
  authorId?: string;
  currentUserId: string;
  take?: number;
}) {
  const posts = await prisma.post.findMany({
    where: authorId ? { authorId } : undefined,
    orderBy: { createdAt: "desc" },
    take,
    include: {
      author: { select: { id: true, displayName: true, username: true, avatar: true } },
      likes: { where: { userId: currentUserId }, select: { id: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { displayName: true, username: true, avatar: true } } },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return posts.map((post) => ({ ...post, likedByMe: post.likes.length > 0 }));
}

export type FeedPost = Awaited<ReturnType<typeof getFeedPosts>>[number];
