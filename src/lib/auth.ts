import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function isAuthenticated() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

// Call at the top of every page and server action that touches data
export async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/login");
}
