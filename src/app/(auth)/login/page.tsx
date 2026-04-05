import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đăng nhập vào CMS Sales Admin
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
