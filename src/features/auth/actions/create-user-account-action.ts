"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { profileStoreAccess, profiles, stores } from "@/db/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuthContext } from "@/features/auth/queries/get-auth-context";
import {
  createUserAccountSchema,
  type CreateUserAccountInput,
} from "@/features/auth/schemas/create-user-account-schema";

function buildInternalEmail(username: string) {
  const domain = process.env.ACCOUNT_EMAIL_DOMAIN || "accounts.cms.local";
  return `${username.toLowerCase()}@${domain}`;
}

export async function createUserAccountAction(input: CreateUserAccountInput) {
  const auth = await requireAuthContext();
  const parsed = createUserAccountSchema.parse(input);

  if (auth.role !== "admin" && auth.role !== "manager") {
    throw new Error("Bạn không có quyền tạo tài khoản");
  }

  if (auth.role === "manager" && parsed.role !== "staff") {
    throw new Error("Quản lý chỉ có thể tạo tài khoản nhân viên");
  }

  if (
    auth.role === "manager" &&
    !auth.allowedStores.some((store) => store.id === parsed.storeId)
  ) {
    throw new Error("Quản lý chỉ có thể tạo tài khoản trong cửa hàng của mình");
  }

  const [store] = await db
    .select({
      id: stores.id,
    })
    .from(stores)
    .where(eq(stores.id, parsed.storeId))
    .limit(1);

  if (!store) {
    throw new Error("Cửa hàng không tồn tại");
  }

  const [existedProfile] = await db
    .select({
      id: profiles.id,
    })
    .from(profiles)
    .where(eq(profiles.username, parsed.username))
    .limit(1);

  if (existedProfile) {
    throw new Error("Tên đăng nhập đã tồn tại");
  }

  const email = buildInternalEmail(parsed.username);

  const [existedEmail] = await db
    .select({
      id: profiles.id,
    })
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);

  if (existedEmail) {
    throw new Error("Tài khoản nội bộ đã tồn tại, vui lòng đổi tên đăng nhập");
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password: parsed.password,
    email_confirm: true,
    user_metadata: {
      username: parsed.username,
      fullName: parsed.fullName || null,
      createdBy: auth.profileId,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "Không thể tạo tài khoản xác thực");
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(profiles).values({
        id: data.user!.id,
        username: parsed.username,
        fullName: parsed.fullName || null,
        email,
        role: parsed.role,
        updatedAt: new Date(),
      });

      await tx.insert(profileStoreAccess).values({
        profileId: data.user!.id,
        storeId: parsed.storeId,
        isDefault: true,
        updatedAt: new Date(),
      });
    });
  } catch (dbError) {
    await adminSupabase.auth.admin.deleteUser(data.user.id);
    throw dbError;
  }

  revalidatePath("/settings");

  return {
    success: true,
    id: data.user.id,
    username: parsed.username,
  };
}
