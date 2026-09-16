import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireUser(role?: "CLINICIAN" | "ORG_ADMIN") {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (role && session.user.role !== role) redirect("/");
  return session.user;
}
