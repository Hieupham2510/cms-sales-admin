"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function CustomerCreatedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("created") !== "1") return;

    toast.success("Tạo khách hàng thành công");
    router.replace(pathname);
  }, [searchParams, router, pathname]);

  return null;
}
