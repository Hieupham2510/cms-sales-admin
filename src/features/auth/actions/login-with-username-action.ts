"use server";

import { redirect } from "next/navigation";
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
    if (!process.env.DATABASE_URL) {
      return { error: "Thiếu cấu hình DATABASE_URL trên môi trường deploy" };
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { error: "Thiếu cấu hình NEXT_PUBLIC_SUPABASE_URL trên môi trường deploy" };
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return {
        error:
          "Thiếu cấu hình NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY trên môi trường deploy",
      };
    }

    const { db } = await import("@/db");

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
