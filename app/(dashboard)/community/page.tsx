import { redirect } from "next/navigation";
import Link from "next/link";
import { Users2 } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getFeedPosts } from "@/src/lib/posts";
import { PostCard } from "@/src/components/post/post-card";
import { CommunityComposer } from "./post-composer";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pinned", label: "BTV lựa chọn" },
  { key: "liked", label: "Yêu thích" },
  { key: "following", label: "Quan tâm" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tab: rawTab } = await searchParams;
  const tab = (TABS.some((t) => t.key === rawTab) ? rawTab : "all") as Tab;

  const [user, posts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { displayName: true, username: true, avatar: true, role: true },
    }),
    getFeedPosts({ currentUserId: session.user.id, tab }),
  ]);

  const name = user?.displayName ?? user?.username ?? "Bạn";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users2 className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">Cộng đồng</h1>
      </div>

      {/* Composer */}
      <CommunityComposer avatar={user?.avatar} name={name} />

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-foreground/10 bg-foreground/5 p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/community${t.key !== "all" ? `?tab=${t.key}` : ""}`}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition
              ${tab === t.key
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground"
              }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted">
              {tab === "liked"
                ? "Bạn chưa thích bài viết nào."
                : tab === "pinned"
                ? "Chưa có bài viết được BTV lựa chọn."
                : tab === "following"
                ? "Những người bạn quan tâm chưa đăng bài."
                : "Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!"}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} isAdmin={user?.role === "ADMIN"} />
          ))
        )}
      </div>
    </div>
  );
}
