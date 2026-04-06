import { MaiLinhLogo } from "@/components/brand/mai-linh-logo";
import { getAuthContext } from "@/features/auth/queries/get-auth-context";
import { redirect } from "next/navigation";

export default async function StaffHomePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center rounded-xl border bg-card">
      <div className="space-y-3 text-center">
        <MaiLinhLogo />
        <p className="text-sm text-muted-foreground">
          Xin chào {auth.fullName ?? auth.username}
        </p>
      </div>
    </div>
  );
}
