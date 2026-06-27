import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { JoinClassroomForm } from "./join-form";

export default async function JoinClassroomPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <JoinClassroomForm />;
}
