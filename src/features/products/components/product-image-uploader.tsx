"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ImageItem = {
  id?: string;
  file?: File;
  imageUrl?: string;
  isPrimary?: boolean;
  sortOrder?: number;
};

type Props = {
  value: ImageItem[];
  onChange: (items: ImageItem[]) => void;
};

export function ProductImageUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);
  const primaryImage = value[0];
  const secondaryImages = value.slice(1);

  const normalize = (items: ImageItem[]) => {
    const next = items.map((item, index) => ({
      ...item,
      sortOrder: index,
      isPrimary: item.isPrimary ?? false,
    }));

    if (next.length > 0 && !next.some((item) => item.isPrimary)) {
      next[0].isPrimary = true;
    }

    return next;
  };

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const next = Array.from(files).map((file, index) => ({
      file,
      imageUrl: URL.createObjectURL(file),
      isPrimary: value.length === 0 && index === 0,
      sortOrder: value.length + index,
    }));

    onChange(normalize([...value, ...next]));
  };

  const handleRemove = (index: number) => {
    const removed = value[index];

    if (removed?.imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(removed.imageUrl);
    }

    const next = value.filter((_, itemIndex) => itemIndex !== index);
    onChange(normalize(next));
    setRemoveIndex(null);
  };

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="group relative min-h-[180px] flex-1 overflow-hidden rounded-xl border border-dashed bg-muted/20">
        {primaryImage?.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryImage.imageUrl}
              alt="product-primary"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/45 px-3 text-center opacity-0 transition-opacity group-hover:opacity-100">
              <div>
                <Button type="button" variant="outline" onClick={handlePick}>
                  + Thêm ảnh
                </Button>
                <p className="mt-3 text-sm text-white/90">Mỗi ảnh không quá 2 MB</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRemoveIndex(0)}
              className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border bg-background/95 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              aria-label="Xóa ảnh chính"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center px-3 text-center">
            <Button type="button" variant="outline" onClick={handlePick}>
              + Thêm ảnh
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">Mỗi ảnh không quá 2 MB</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {secondaryImages.map((image, secondaryIndex) => {
          const index = secondaryIndex + 1;

          return (
          <div key={image.id ?? `${image.imageUrl}-${index}`} className="relative">
            <div className="flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-md border bg-muted/20">
              {image.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.imageUrl}
                  alt="product"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-muted-foreground">IMG</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setRemoveIndex(index)}
              className="absolute -right-1.5 -top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border bg-background text-muted-foreground hover:text-foreground"
              aria-label="Xóa ảnh"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          );
        })}
      </div>

      <Dialog open={removeIndex !== null} onOpenChange={(open) => !open && setRemoveIndex(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa ảnh</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa ảnh này?
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRemoveIndex(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (removeIndex !== null) handleRemove(removeIndex);
              }}
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
