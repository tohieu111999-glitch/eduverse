import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { getFeedPosts } from "@/src/lib/posts";
import { PostComposer } from "./post-composer";
import { PostCard } from "@/src/components/post/post-card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const posts = await getFeedPosts({ currentUserId: session.user.id });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <PostComposer />

      {posts.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ điều gì đó!
        </p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
