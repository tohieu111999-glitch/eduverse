import Link from "next/link";
import { GlassCard } from "@/src/components/ui/glass-card";
import { LikeButton } from "@/src/components/post/like-button";
import { CommentSection } from "@/src/components/post/comment-section";
import type { FeedPost } from "@/src/lib/posts";

function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export function PostCard({ post }: { post: FeedPost }) {
  const name = post.author.displayName ?? post.author.username ?? "Người dùng EduVerse";
  const initial = name.charAt(0).toUpperCase();
  const avatarSpan = (
    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full gradient-cyber text-sm font-semibold text-white">
      {post.author.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.author.avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3">
        {post.author.username ? <Link href={`/profile/${post.author.username}`}>{avatarSpan}</Link> : avatarSpan}
        <div>
          {post.author.username ? (
            <Link href={`/profile/${post.author.username}`} className="text-sm font-medium hover:underline">
              {name}
            </Link>
          ) : (
            <p className="text-sm font-medium">{name}</p>
          )}
          <p className="text-xs text-muted">{formatRelativeTime(post.createdAt)}</p>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm">{post.content}</p>
      <div className="mt-4 flex items-center gap-5 text-xs">
        <LikeButton postId={post.id} likedByMe={post.likedByMe} count={post._count.likes} />
        <CommentSection postId={post.id} comments={post.comments} count={post._count.comments} />
      </div>
    </GlassCard>
  );
}
