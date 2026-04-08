import Image from "next/image";

interface LoadingOverlayProps {
  label?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  label = "Đang chuyển trang...",
  fullScreen = false,
}: LoadingOverlayProps) {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-[1px]"
          : "pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-[1px]"
      }
    >
      <div className="flex flex-col items-center gap-3 rounded-sm bg-card/95 px-5 py-4 shadow-sm">
        <div className="relative h-16 w-16 overflow-hidden rounded-sm">
          <Image
            src="/logo.png"
            alt="Logo cửa hàng"
            fill
            className="object-cover"
            sizes="64px"
            priority
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}
