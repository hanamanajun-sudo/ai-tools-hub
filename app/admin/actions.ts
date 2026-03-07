"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

function getSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return crypto.createHash("sha256").update(`admin:${password}`).digest("hex");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth")?.value;
  return token === getSessionToken();
}

export async function loginAction(formData: FormData) {
  const input = (formData.get("password") as string) ?? "";
  const expected = process.env.ADMIN_PASSWORD ?? "";

  const inputBuf = Buffer.from(input.padEnd(Math.max(input.length, expected.length)));
  const expectedBuf = Buffer.from(expected.padEnd(Math.max(input.length, expected.length)));
  const match = inputBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(inputBuf, expectedBuf);

  if (match) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", getSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    redirect("/admin");
  }

  redirect("/admin?error=1");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  redirect("/admin");
}

export async function deleteReview(id: string) {
  if (!(await isAuthenticated())) return;
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/admin");
}

export async function toggleHidden(id: string, hidden: boolean) {
  if (!(await isAuthenticated())) return;
  await supabase.from("reviews").update({ hidden }).eq("id", id);
  revalidatePath("/admin");
}
