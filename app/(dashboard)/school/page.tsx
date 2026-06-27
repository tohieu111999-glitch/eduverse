import Link from "next/link";
import { redirect } from "next/navigation";
import { School as SchoolIcon, Users } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { AddTeacherForm } from "./add-teacher-form";
import { CreateClassroomForm } from "./create-classroom-form";
import { RemoveTeacherButton } from "./remove-teacher-button";

export default async function SchoolPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SCHOOL_ADMIN") redirect("/dashboard");

  const school = await prisma.school.findUnique({
    where: { adminId: session.user.id },
    include: {
      teachers: { include: { teacher: { select: { id: true, displayName: true, username: true } } } },
      classrooms: {
        include: { teacher: { select: { displayName: true, username: true } }, _count: { select: { members: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!school) redirect("/dashboard");

  const teacherOptions = school.teachers.map((st) => ({
    id: st.teacherId,
    name: st.teacher.displayName ?? st.teacher.username ?? st.teacherId,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <SchoolIcon className="h-6 w-6 text-accent" />
        <h1 className="text-xl font-semibold">{school.name}</h1>
      </div>

      <GlassCard className="p-6">
        <h2 className="mb-3 text-sm font-medium text-muted">Giáo viên trong trường</h2>
        <AddTeacherForm />
        {school.teachers.length > 0 && (
          <div className="mt-4 divide-y divide-foreground/10">
            {school.teachers.map((st) => (
              <div key={st.id} className="flex items-center justify-between py-2 text-sm">
                <span>{st.teacher.displayName ?? st.teacher.username}</span>
                <RemoveTeacherButton schoolTeacherId={st.id} />
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="mb-3 text-sm font-medium text-muted">Tạo lớp học</h2>
        <CreateClassroomForm teachers={teacherOptions} />
      </GlassCard>

      {school.classrooms.length > 0 && (
        <GlassCard className="divide-y divide-foreground/10 p-2">
          {school.classrooms.map((c) => (
            <Link
              key={c.id}
              href={`/classroom/${c.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-foreground/5"
            >
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted">GV: {c.teacher.displayName ?? c.teacher.username}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted">
                <Users className="h-3.5 w-3.5" />
                {c._count.members}
              </span>
            </Link>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
