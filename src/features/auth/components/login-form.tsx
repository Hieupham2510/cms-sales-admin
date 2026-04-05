"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import {
  loginWithUsernameAction,
  type LoginActionState,
} from "@/features/auth/actions/login-with-username-action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: LoginActionState = {
  error: null,
};

const LOGIN_STORAGE_KEY = "cms_login_credentials";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Đang đăng nhập..." : "Đăng nhập"}
    </Button>
  );
}

export function LoginForm() {
  const [storedCredentials] = useState(() => {
    if (typeof window === "undefined") {
      return { username: "", password: "", remember: false };
    }

    try {
      const raw = localStorage.getItem(LOGIN_STORAGE_KEY);
      if (!raw) return { username: "", password: "", remember: false };

      const parsed = JSON.parse(raw) as {
        username?: string;
        password?: string;
        remember?: boolean;
      };

      return {
        username: parsed.username ?? "",
        password: parsed.password ?? "",
        remember: Boolean(parsed.remember),
      };
    } catch {
      return { username: "", password: "", remember: false };
    }
  });
  const [username, setUsername] = useState(storedCredentials.username);
  const [password, setPassword] = useState(storedCredentials.password);
  const [rememberLogin, setRememberLogin] = useState(storedCredentials.remember);
  const [state, formAction] = useActionState(
    loginWithUsernameAction,
    initialState,
  );

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  return (
    <form
      action={formAction}
      className="space-y-4"
      onSubmit={() => {
        if (rememberLogin) {
          localStorage.setItem(
            LOGIN_STORAGE_KEY,
            JSON.stringify({
              remember: true,
              username,
              password,
            }),
          );
          return;
        }

        localStorage.removeItem(LOGIN_STORAGE_KEY);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="username">Tên đăng nhập</Label>
        <Input
          id="username"
          name="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="remember-login"
          type="checkbox"
          checked={rememberLogin}
          onChange={(event) => setRememberLogin(event.target.checked)}
          className="size-4 rounded border-border"
        />
        <Label htmlFor="remember-login" className="text-sm font-normal">
          Lưu thông tin đăng nhập
        </Label>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
