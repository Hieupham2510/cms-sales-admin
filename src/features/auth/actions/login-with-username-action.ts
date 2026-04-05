"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export type LoginActionState = {
  error: string | null;
};

export async function loginWithUsernameAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu" };
  }

  try {
    const profile = await db
      .select({
        email: profiles.email,
      })
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);

    if (!profile[0]?.email) {
      return { error: "Tên đăng nhập hoặc mật khẩu không đúng" };
    }

    const supabase = await createClient();

    const { error, data } = await supabase.auth.signInWithPassword({
      email: profile[0].email,
      password,
    });

    if (error || !data.user) {
      return { error: "Tên đăng nhập hoặc mật khẩu không đúng" };
    }
  } catch {
    return { error: "Đăng nhập thất bại. Vui lòng thử lại." };
  }

  redirect("/dashboard");
}
