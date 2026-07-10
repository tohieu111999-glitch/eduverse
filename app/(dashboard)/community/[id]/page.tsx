import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Pin } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { LikeButton } from "@/src/components/post/like-button";
import { AddCommentForm } from "../add-comment-form";
import { pinPostAction } from "../actions";

function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

function getLevelBadge(level: number) {
  if (level >= 50) return "bg-red-500/20 text-red-400";
  if (level >= 40) return "bg-amber-500/20 text-amber-400";
  if (level >= 30) return "bg-purple-500/20 text-purple-400";
  if (level >= 20) return "bg-blue-500/20 text-blue-400";
  if (level >= 10) return "bg-green-500/20 text-green-400";
  return "bg-foreground/10 text-muted";
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const [post, user] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, displayName: true, username: true, avatar: true, level: true } },
        likes: { where: { userId: session.user.id }, select: { id: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { displayName: true, username: true, avatar: true } } },
        },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    }),
  ]);

  if (!post) notFound();

  // Increment views
  await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });

  const isAdmin = user?.role === "ADMIN";
  const likedByMe = post.likes.length > 0;
  const name = post.author.displayName ?? post.author.username ?? "Người dùng EduVerse";
  const initial = name.charAt(0).toUpperCase();
  const levelClass = getLevelBadge(post.author.level);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link href="/community" className="text-muted transition hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-semibold">Bài viết</h1>
      </div>

      {/* Post card */}
      <GlassCard className="p-5 space-y-4">
        {/* Author row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={post.author.username ? `/profile/${post.author.username}` : "#"}>
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full gradient-cyber text-sm font-semibold text-white">
                {post.author.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.avatar} alt={name} className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </span>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={post.author.username ? `/profile/${post.author.username}` : "#"}
                  className="text-sm font-medium hover:underline"
                >
                  {name}
                </Link>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${levelClass}`}>
                  Lv.{post.author.level}
                </span>
                {post.isPinned && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                    <Pin className="h-2.5 w-2.5" /> BTV chọn
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">{formatRelativeTime(post.createdAt)}</p>
            </div>
          </div>

          {/* Admin pin toggle */}
          {isAdmin && (
            <form action={pinPostAction.bind(null, post.id, !post.isPinned)}>
              <button
                type="submit"
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition
                  ${post.isPinned
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                    : "border-foreground/10 text-muted hover:border-primary hover:text-primary"
                  }`}
              >
                <Pin className="h-3.5 w-3.5" />
                {post.isPinned ? "Bỏ ghim" : "Ghim"}
              </button>
            </form>
          )}
        </div>

        {/* Title */}
        {post.title && (
          <h2 className="text-lg font-semibold leading-snug">{post.title}</h2>
        )}

        {/* Content */}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{post.content}</p>

        {/* Images */}
        {post.images.length > 0 && (
          <div className={`grid gap-2 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {post.images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt=""
                className="w-full rounded-xl object-cover"
                style={{ maxHeight: "400px" }}
              />
            ))}
          </div>
        )}

        {/* Footer: likes / comments / views */}
        <div className="flex items-center gap-5 border-t border-foreground/10 pt-3 text-xs">
          <LikeButton postId={post.id} likedByMe={likedByMe} count={post._count.likes} />
          <span className="flex items-center gap-1.5 text-muted">
            <Eye className="h-4 w-4" /> {post.views + 1}
          </span>
        </div>
      </GlassCard>

      {/* Comments */}
      <GlassCard className="p-5 space-y-3">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Bình luận ({post._count.comments})
        </h3>
        {post.comments.map((c) => {
          const cName = c.author.displayName ?? c.author.username ?? "Người dùng";
          const cInitial = cName.charAt(0).toUpperCase();
          return (
            <div key={c.id} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full gradient-cyber text-xs font-semibold text-white">
                {c.author.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.author.avatar} alt={cName} className="h-full w-full object-cover" />
                ) : cInitial}
              </span>
              <div className="flex-1 rounded-xl bg-foreground/5 px-3 py-2 text-sm">
                <span className="font-medium">{cName}: </span>
                <span className="text-foreground/80">{c.content}</span>
              </div>
            </div>
          );
        })}
        <AddCommentForm postId={post.id} />
      </GlassCard>
    </div>
  );
}
