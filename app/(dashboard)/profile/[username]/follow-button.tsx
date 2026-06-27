"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserMinus, UserPlus } from "lucide-react";
import { toggleFollowAction } from "./actions";
import { Button } from "@/src/components/ui/button";

export function FollowButton({ targetUserId, initiallyFollowing }: { targetUserId: string; initiallyFollowing: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initiallyFollowing);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await toggleFollowAction(targetUserId);
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setFollowing(Boolean(result.following));
    router.refresh();
  }

  return (
    <Button onClick={handleClick} disabled={pending} variant={following ? "glass" : "primary"}>
      {following ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {following ? "Đang theo dõi" : "Theo dõi"}
    </Button>
  );
}
