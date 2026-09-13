"use server"

import { getServerSession } from "@/lib/get-session";

export type PagesActionState = {
  error?: string | null;
  success?: boolean;
} | null;

async function requireAdmin() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "admin") {
    throw new Error("Forbidden: Only administrators can manage users.");
  }
  return session;
}


