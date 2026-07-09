import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { CreateCourseForm } from "./create-form";

export default async function CreateCoursePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <CreateCourseForm />;
}
