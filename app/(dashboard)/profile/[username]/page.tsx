import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Coins, Crown, FileText, Users } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getFeedPosts } from "@/src/lib/posts";
import { isVip } from "@/src/lib/vip";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";
import { ExpBar } from "@/src/components/dashboard/exp-bar";
import { PostCard } from "@/src/components/post/post-card";
import { VipCrown } from "@/src/components/vip-crown";
import { AchievementBadge } from "@/src/components/achievement-badge";
import { FollowButton } from "./follow-button";
import { MessageButton } from "./message-button";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatar: true,
      banner: true,
      bio: true,
      level: true,
      exp: true,
      coins: true,
      vipLevel: true,
      vipExpiresAt: true,
      createdAt: true,
      _count: { select: { posts: true, followers: true, following: true, documents: true } },
    },
  });

  if (!user) notFound();

  const isOwnProfile = user.id === session.user.id;
  const [isFollowing, posts, achievements] = await Promise.all([
    isOwnProfile
      ? Promise.resolve(false)
      : prisma.follow
          .findUnique({ where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } } })
          .then(Boolean),
    getFeedPosts({ authorId: user.id, currentUserId: session.user.id }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
      include: { achievement: true },
    }),
  ]);

  const name = user.displayName ?? user.username ?? "Người dùng EduVerse";
  const joined = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(user.createdAt);
  const showVip = isVip(user);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div
        className="h-32 rounded-2xl gradient-cyber sm:h-48"
        style={user.banner ? { backgroundImage: `url(${user.banner})`, backgroundSize: "cover" } : undefined}
      />

      <GlassCard className="relative -mt-10 p-6">
        <div className="flex items-end gap-4">
          <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-background gradient-cyber text-2xl font-semibold text-white">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{name}</h1>
              <VipCrown vipLevel={user.vipLevel} vipExpiresAt={user.vipExpiresAt} size="md" />
            </div>
            <p className="text-sm text-muted">
              {user.username ? `@${user.username}` : ""} · Tham gia {joined}
            </p>
          </div>
          {showVip && (
            <span className="ml-auto rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              {user.vipLevel === "VIP_PLUS" ? "VIP+" : "VIP"}
            </span>
          )}
          {isOwnProfile && !showVip && (
            <Link href="/vip" className={buttonVariants("primary", "ml-auto")}>
              <Crown className="h-4 w-4" />
              Nâng cấp VIP
            </Link>
          )}
          {!isOwnProfile && (
            <div className={`flex gap-2 ${showVip ? "" : "ml-auto"}`}>
              <MessageButton targetUserId={user.id} />
              <FollowButton targetUserId={user.id} initiallyFollowing={isFollowing} />
            </div>
          )}
        </div>

        {user.bio && <p className="mt-4 text-sm">{user.bio}</p>}

        <div className="mt-5">
          <ExpBar level={user.level} exp={user.exp} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={FileText} label="Bài viết" value={user._count.posts} />
          <Stat icon={Users} label="Theo dõi" value={user._count.followers} />
          <Stat icon={Users} label="Đang theo dõi" value={user._count.following} />
          <Stat icon={Coins} label="Coins" value={user.coins} />
        </div>

        {achievements.length > 0 && (
          <div className="mt-6 border-t border-foreground/10 pt-5">
            <p className="mb-3 text-xs font-medium text-muted">Huy hiệu</p>
            <div className="flex flex-wrap gap-4">
              {achievements.map((ua) => (
                <AchievementBadge
                  key={ua.id}
                  icon={ua.achievement.icon}
                  name={ua.achievement.name}
                  description={ua.achievement.description}
                />
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-foreground/5 p-3 text-center">
      <Icon className="mx-auto mb-1 h-4 w-4 text-muted" />
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
