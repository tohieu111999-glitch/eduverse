import { prisma } from "@/src/lib/prisma";

export async function canViewQuiz(
  quiz: { id: string; ownerId: string; visibility: "PUBLIC" | "FRIENDS" | "PRIVATE" },
  viewerId: string,
): Promise<boolean> {
  if (quiz.ownerId === viewerId) return true;
  if (quiz.visibility === "PUBLIC") return true;

  if (quiz.visibility === "FRIENDS") {
    const [viewerFollowsOwner, ownerFollowsViewer] = await Promise.all([
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewerId, followingId: quiz.ownerId } },
      }),
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: quiz.ownerId, followingId: viewerId } },
      }),
    ]);
    if (viewerFollowsOwner && ownerFollowsViewer) return true;
  }

  // A quiz used as a course lesson stays reachable for that course's
  // enrolled students/instructor regardless of its own visibility — an
  // instructor shouldn't have to remember to flip a quiz to PUBLIC just
  // because they embedded it in a paid course.
  const courseLesson = await prisma.courseLesson.findUnique({
    where: { quizId: quiz.id },
    select: { section: { select: { courseId: true } } },
  });
  if (courseLesson) {
    const courseId = courseLesson.section.courseId;
    const [enrolled, course] = await Promise.all([
      prisma.courseEnrollment.findUnique({ where: { courseId_userId: { courseId, userId: viewerId } } }),
      prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } }),
    ]);
    if (enrolled || course?.instructorId === viewerId) return true;
  }

  return false;
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
