import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { CreateClassroomForm } from "./create-form";

export default async function CreateClassroomPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/classroom");

  return <CreateClassroomForm />;
}
