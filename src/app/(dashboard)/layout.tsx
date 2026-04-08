import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/features/auth/queries/get-auth-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login");
  }
  const activeStore =
    auth.allowedStores.find((store) => store.id === auth.activeStoreId) ?? null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar
        role={auth.role}
        storeName={activeStore?.name ?? null}
        storeLogoUrl={activeStore?.logoUrl ?? null}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          auth={auth}
          activeStoreName={activeStore?.name ?? null}
          activeStoreLogoUrl={activeStore?.logoUrl ?? null}
        />
        <main className="page-container flex-1">{children}</main>
      </div>
    </div>
  );
}
