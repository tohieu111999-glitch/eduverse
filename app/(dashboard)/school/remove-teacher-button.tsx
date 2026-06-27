"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { removeTeacherAction } from "./actions";

export function RemoveTeacherButton({ schoolTeacherId }: { schoolTeacherId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleRemove() {
    setPending(true);
    await removeTeacherAction(schoolTeacherId);
    setPending(false);
    router.refresh();
  }

  return (
    <button onClick={handleRemove} disabled={pending} className="text-muted hover:text-red-500">
      <X className="h-4 w-4" />
    </button>
  );
}
