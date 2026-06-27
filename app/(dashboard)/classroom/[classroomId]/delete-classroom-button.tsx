"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteClassroomAction } from "./actions";

export function DeleteClassroomButton({ classroomId }: { classroomId: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Xoá lớp học này? Toàn bộ học sinh sẽ bị gỡ khỏi lớp. Hành động này không thể hoàn tác.")) return;
    setPending(true);
    await deleteClassroomAction(classroomId);
  }

  return (
    <button onClick={handleDelete} disabled={pending} className="shrink-0 text-muted hover:text-red-500">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
