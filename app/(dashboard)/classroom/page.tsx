import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, Plus, Users } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { GlassCard } from "@/src/components/ui/glass-card";
import { buttonVariants } from "@/src/components/ui/button";

export default async function ClassroomListPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id: userId, role } = session.user;
  if (role !== "TEACHER" && role !== "STUDENT") redirect("/dashboard");

  const classrooms =
    role === "TEACHER"
      ? (
          await prisma.classroom.findMany({
            where: { teacherId: userId },
            include: { _count: { select: { members: true } } },
            orderBy: { createdAt: "desc" },
          })
        ).map((c) => ({ id: c.id, name: c.name, memberCount: c._count.members, teacherLabel: null as string | null }))
      : (
          await prisma.classroomMember.findMany({
            where: { studentId: userId },
            include: {
              classroom: {
                include: { _count: { select: { members: true } }, teacher: { select: { displayName: true, username: true } } },
              },
            },
            orderBy: { joinedAt: "desc" },
          })
        ).map((m) => ({
          id: m.classroom.id,
          name: m.classroom.name,
          memberCount: m.classroom._count.members,
          teacherLabel: m.classroom.teacher.displayName ?? m.classroom.teacher.username,
        }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-semibold">Lớp học</h1>
        </div>
        <div className="flex gap-2">
          {role === "STUDENT" && (
            <Link href="/classroom/join" className={buttonVariants("glass")}>
              Tham gia lớp
            </Link>
          )}
          {role === "TEACHER" && (
            <Link href="/classroom/create" className={buttonVariants("primary")}>
              <Plus className="h-4 w-4" />
              Tạo lớp
            </Link>
          )}
        </div>
      </div>

      {classrooms.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          {role === "TEACHER" ? "Bạn chưa tạo lớp học nào." : "Bạn chưa tham gia lớp học nào."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {classrooms.map((c) => (
            <Link key={c.id} href={`/classroom/${c.id}`}>
              <GlassCard className="p-4 transition hover:-translate-y-0.5">
                <h3 className="font-semibold">{c.name}</h3>
                {c.teacherLabel && <p className="mt-1 text-xs text-muted">GV: {c.teacherLabel}</p>}
                <p className="mt-2 flex items-center gap-1 text-xs text-muted">
                  <Users className="h-3.5 w-3.5" />
                  {c.memberCount} học sinh
                </p>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
