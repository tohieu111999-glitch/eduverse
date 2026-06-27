import { notFound, redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { canManageClassroom, canViewClassroom } from "@/src/lib/classroom";
import { GlassCard } from "@/src/components/ui/glass-card";
import { CreateStudentForm } from "./create-student-form";
import { StudentRow } from "./student-row";
import { DeleteClassroomButton } from "./delete-classroom-button";

export default async function ClassroomDetailPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const { classroomId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    include: {
      teacher: { select: { displayName: true, username: true } },
      school: { select: { name: true } },
      members: { include: { student: { select: { id: true, displayName: true, username: true } } }, orderBy: { joinedAt: "asc" } },
    },
  });
  if (!classroom) notFound();
  if (!(await canViewClassroom(classroom, session.user.id))) notFound();

  const canManage = await canManageClassroom(classroom, session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{classroom.name}</h1>
            <p className="mt-1 text-sm text-muted">GV: {classroom.teacher.displayName ?? classroom.teacher.username}</p>
            {classroom.school && <p className="text-xs text-muted">Trường: {classroom.school.name}</p>}
            {canManage && (
              <p className="mt-2 text-xs text-muted">
                Mã lớp: <span className="font-mono font-semibold text-foreground">{classroom.joinCode}</span>
              </p>
            )}
          </div>
          {canManage && <DeleteClassroomButton classroomId={classroom.id} />}
        </div>
      </GlassCard>

      {canManage && (
        <GlassCard className="p-6">
          <h2 className="mb-3 text-sm font-medium text-muted">Tạo tài khoản học sinh</h2>
          <CreateStudentForm classroomId={classroom.id} />
        </GlassCard>
      )}

      <GlassCard className="divide-y divide-foreground/10 p-4">
        <h2 className="pb-2 text-sm font-medium text-muted">Học sinh ({classroom.members.length})</h2>
        {classroom.members.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Chưa có học sinh nào trong lớp.</p>
        ) : (
          classroom.members.map((m) => (
            <StudentRow
              key={m.id}
              classroomId={classroom.id}
              studentId={m.student.id}
              name={m.student.displayName ?? m.student.username ?? m.student.id}
              canManage={canManage}
            />
          ))
        )}
      </GlassCard>
    </div>
  );
}
