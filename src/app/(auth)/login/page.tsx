import Image from "next/image";

import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-5">
        <div className="flex justify-center">
          <div className="relative h-44 w-full max-w-[360px] overflow-hidden">
            <Image
              src="/logo.png"
              alt="Áo Dài Liche"
              fill
              className="object-cover"
              sizes="360px"
              priority
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Đăng nhập vào CMS Sales Admin
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
