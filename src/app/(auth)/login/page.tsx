import { cookies } from "next/headers";
import { LoginForm } from "@/features/auth/components/login-form";
import { ACTIVE_STORE_COOKIE } from "@/features/auth/constants";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const activeStoreId = cookieStore.get(ACTIVE_STORE_COOKIE)?.value ?? null;

  let activeStore: { id: string; name: string; logoUrl: string | null } | null = null;
  if (activeStoreId && process.env.DATABASE_URL) {
    try {
      const [{ db }, { stores }, { eq }] = await Promise.all([
        import("@/db"),
        import("@/db/schema"),
        import("drizzle-orm"),
      ]);

      const [store] = await db
        .select({
          id: stores.id,
          name: stores.name,
          logoUrl: stores.logoUrl,
        })
        .from(stores)
        .where(eq(stores.id, activeStoreId))
        .limit(1);

      activeStore = store ?? null;
    } catch {
      activeStore = null;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-5">
        <div className="flex justify-center">
          <div className="relative h-44 w-full max-w-[360px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeStore?.logoUrl || "/logo.png"}
              alt={`Logo ${activeStore?.name ?? "cửa hàng"}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {`Đăng nhập vào hệ thống ${activeStore?.name ?? "quản trị bán hàng"}`}
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
