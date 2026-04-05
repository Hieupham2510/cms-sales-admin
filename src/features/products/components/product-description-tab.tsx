"use client";

import type { UseFormReturn } from "react-hook-form";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2, ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type {
  ProductFormInput,
  ProductFormValues,
} from "@/features/products/schemas/product-form-schema";

type Props = {
  form: UseFormReturn<ProductFormInput, unknown, ProductFormValues>;
};

function ToolbarButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-8 min-w-8 items-center justify-center rounded border bg-background px-2 text-muted-foreground hover:text-foreground"
    >
      {children}
    </button>
  );
}

function DescriptionBox({
  title,
  value,
  onChange,
  minHeight,
  showToolbar = false,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  minHeight: number;
  showToolbar?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="min-w-[56px] text-[18px] font-semibold">{title}</div>

          {showToolbar ? (
            <>
              <select className="h-8 rounded border bg-background px-3 text-sm">
                <option>Format</option>
              </select>

              <div className="flex flex-wrap items-center gap-1">
                <ToolbarButton>
                  <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton>
                  <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton>
                  <Underline className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton>
                  <AlignLeft className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton>
                  <AlignCenter className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton>
                  <AlignRight className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton>
                  <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton>
                  <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton>
                  <Link2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton>
                  <ImageIcon className="h-4 w-4" />
                </ToolbarButton>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="bg-background p-0">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-0 resize-none rounded-none border-0 shadow-none focus-visible:ring-0"
          style={{ minHeight }}
          placeholder=""
        />
      </div>
    </div>
  );
}

export default function ProductDescriptionTab({ form }: Props) {
  const description = form.watch("description") ?? "";
  const orderNote = form.watch("orderNote") ?? "";

  return (
    <div className="space-y-4">
      <DescriptionBox
        title="Mô tả"
        value={description}
        onChange={(value) => form.setValue("description", value)}
        minHeight={180}
        showToolbar
      />

      <DescriptionBox
        title="Mẫu ghi chú (hóa đơn, đặt hàng)"
        value={orderNote}
        onChange={(value) => form.setValue("orderNote", value)}
        minHeight={120}
      />
    </div>
  );
}
