import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { use } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = use(createClient());

  const {
    data: { user },
  } = use(supabase.auth.getUser());

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="page-container flex-1">{children}</main>
      </div>
    </div>
  );
}
