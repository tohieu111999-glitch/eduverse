import Link from "next/link";
import { Eye, MessageSquare, Pin } from "lucide-react";
import { GlassCard } from "@/src/components/ui/glass-card";
import { LikeButton } from "@/src/components/post/like-button";
import { VipCrown } from "@/src/components/vip-crown";
import type { FeedPost } from "@/src/lib/posts";
import { pinPostAction } from "@/app/(dashboard)/community/actions";

function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

function getLevelClass(level: number) {
  if (level >= 50) return "bg-red-500/20 text-red-400";
  if (level >= 40) return "bg-amber-500/20 text-amber-400";
  if (level >= 30) return "bg-purple-500/20 text-purple-400";
  if (level >= 20) return "bg-blue-500/20 text-blue-400";
  if (level >= 10) return "bg-green-500/20 text-green-400";
  return "bg-foreground/10 text-muted";
}

export function PostCard({ post, isAdmin }: { post: FeedPost; isAdmin?: boolean }) {
  const name = post.author.displayName ?? post.author.username ?? "Người dùng EduVerse";
  const initial = name.charAt(0).toUpperCase();
  const avatarEl = (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full gradient-cyber text-sm font-semibold text-white">
      {post.author.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.author.avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );

  const levelClass = getLevelClass(post.author.level);

  return (
    <GlassCard className="p-4 space-y-3">
      {/* Author row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {post.author.username ? (
            <Link href={`/profile/${post.author.username}`}>{avatarEl}</Link>
          ) : avatarEl}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {post.author.username ? (
                <Link href={`/profile/${post.author.username}`} className="text-sm font-medium hover:underline">
                  {name}
                </Link>
              ) : (
                <p className="text-sm font-medium">{name}</p>
              )}
              <VipCrown vipLevel={post.author.vipLevel} vipExpiresAt={post.author.vipExpiresAt} />
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

        {isAdmin && (
          <form action={pinPostAction.bind(null, post.id, !post.isPinned)}>
            <button
              type="submit"
              title={post.isPinned ? "Bỏ ghim" : "Ghim bài"}
              className={`flex items-center gap-1 rounded-xl border px-2 py-1 text-xs transition
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
        <Link href={`/community/${post.id}`} className="block">
          <h3 className="font-semibold leading-snug hover:text-primary transition">{post.title}</h3>
        </Link>
      )}

      {/* Content preview */}
      <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
        {post.content}
      </p>

      <Link
        href={`/community/${post.id}`}
        className="inline-block text-xs font-medium text-primary hover:underline"
      >
        Xem thêm →
      </Link>

      {/* Footer */}
      <div className="flex items-center gap-5 border-t border-foreground/10 pt-3 text-xs">
        <LikeButton postId={post.id} likedByMe={post.likedByMe} count={post._count.likes} />
        <Link
          href={`/community/${post.id}`}
          className="flex items-center gap-1.5 text-muted transition hover:text-foreground"
        >
          <MessageSquare className="h-4 w-4" /> {post._count.comments}
        </Link>
        <span className="flex items-center gap-1.5 text-muted">
          <Eye className="h-4 w-4" /> {post.views}
        </span>
      </div>
    </GlassCard>
  );
}
