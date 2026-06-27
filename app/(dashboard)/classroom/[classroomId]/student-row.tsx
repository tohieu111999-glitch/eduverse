"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { removeStudentAction } from "./actions";

export function StudentRow({
  classroomId,
  studentId,
  name,
  canManage,
}: {
  classroomId: string;
  studentId: string;
  name: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleRemove() {
    setPending(true);
    await removeStudentAction(classroomId, studentId);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span>{name}</span>
      {canManage && (
        <button onClick={handleRemove} disabled={pending} className="text-muted hover:text-red-500">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
