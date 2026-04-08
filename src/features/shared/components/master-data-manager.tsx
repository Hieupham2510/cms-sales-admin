"use client"

import { useMemo, useState, useTransition } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TablePagination } from "@/components/shared/table-pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AppRole } from "@/features/auth/types"
import { TABLE_PAGE_SIZE } from "@/lib/constants"

type Item = {
  id: string
  name: string
}

type Props = {
  role: AppRole
  title: string
  description: string
  entityLabel: string
  initialItems: Item[]
  listAction?: () => Promise<Item[]>
  createAction: (input: { name: string }) => Promise<Item>
  updateAction: (input: { id: string; name: string }) => Promise<Item | null>
  deleteAction: (input: { id: string }) => Promise<{ success: boolean }>
}

function sortByName(items: Item[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "vi"))
}

export function MasterDataManager({
  role,
  title,
  description,
  entityLabel,
  initialItems,
  listAction,
  createAction,
  updateAction,
  deleteAction,
}: Props) {
  const [items, setItems] = useState<Item[]>(sortByName(initialItems))
  const [open, setOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<Item | null>(null)
  const [name, setName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / TABLE_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * TABLE_PAGE_SIZE
    return items.slice(start, start + TABLE_PAGE_SIZE)
  }, [currentPage, items])

  const dialogTitle = useMemo(
    () => (editingId ? `Sửa ${entityLabel}` : `Thêm ${entityLabel}`),
    [editingId, entityLabel],
  )

  const resetDialog = () => {
    setEditingId(null)
    setName("")
  }

  const openCreateDialog = () => {
    resetDialog()
    setOpen(true)
  }

  const openEditDialog = (item: Item) => {
    setEditingId(item.id)
    setName(item.name)
    setOpen(true)
  }

  const refreshList = () => {
    if (!listAction) return

    startTransition(async () => {
      try {
        const latest = await listAction()
        setItems(sortByName(latest))
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể tải dữ liệu")
      }
    })
  }

  const handleSave = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error(`Vui lòng nhập tên ${entityLabel}`)
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          const updated = await updateAction({ id: editingId, name: trimmedName })
          if (!updated) {
            toast.error(`Không tìm thấy ${entityLabel} để cập nhật`)
            return
          }

          const next = items.map((item) => (item.id === updated.id ? updated : item))
          setItems(sortByName(next))
          toast.success(`Cập nhật ${entityLabel} thành công`)
        } else {
          const created = await createAction({ name: trimmedName })
          setItems(sortByName([...items, created]))
          toast.success(`Tạo ${entityLabel} thành công`)
        }

        setOpen(false)
        resetDialog()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  const handleDelete = (item: Item) => {
    startTransition(async () => {
      try {
        await deleteAction({ id: item.id })
        setItems((prev) => prev.filter((x) => x.id !== item.id))
        toast.success(`Xóa ${entityLabel} thành công`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể xóa dữ liệu")
      }
      setDeletingItem(null)
    })
  }

  return (
    <div className="section-block space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-description">{description}</p>
        </div>

        <div className="toolbar-actions">
          <Button type="button" variant="outline" onClick={refreshList} disabled={isPending}>
            Làm mới
          </Button>
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="size-4" />
            Thêm {entityLabel}
          </Button>
        </div>
      </div>

      <Card className="app-card">
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Tên</TableHead>
                <TableHead className="w-44 text-right text-muted-foreground">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">
                    {(currentPage - 1) * TABLE_PAGE_SIZE + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button type="button" size="icon-sm" variant="ghost" onClick={() => openEditDialog(item)}>
                        <Pencil className="size-4" />
                      </Button>
                      {role === "admin" ? (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => setDeletingItem(item)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    Chưa có dữ liệu.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
          <TablePagination
            page={currentPage}
            totalItems={items.length}
            pageSize={TABLE_PAGE_SIZE}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="master-data-name">Tên {entityLabel}</Label>
            <Input
              id="master-data-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`Nhập tên ${entityLabel}`}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {editingId ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingItem)} onOpenChange={(nextOpen) => !nextOpen && setDeletingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            {`Bạn có chắc chắn muốn xóa ${entityLabel} "${deletingItem?.name ?? ""}"?`}
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeletingItem(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending || !deletingItem}
              onClick={() => deletingItem && handleDelete(deletingItem)}
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
