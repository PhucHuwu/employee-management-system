'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, CalendarX } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import type { OffDay } from '@/lib/types'
import { offDayApi } from '@/lib/api/endpoints'

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="ml-auto h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

export default function OffDaysPage() {
  const [items, setItems] = useState<OffDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OffDay | null>(null)
  const [formName, setFormName] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formNote, setFormNote] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<OffDay | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await offDayApi.getAll({ size: 100 })
      setItems(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách ngày nghỉ lễ')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormName('')
    setFormDate('')
    setFormNote('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: OffDay) => {
    setEditingItem(item)
    setFormName(item.name)
    setFormDate(item.offDate.split('T')[0])
    setFormNote(item.note || '')
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên ngày nghỉ')
      return
    }
    if (!formDate.trim()) {
      toast.error('Vui lòng chọn ngày')
      return
    }
    try {
      const payload = {
        name: formName.trim(),
        offDate: new Date(formDate).toISOString(),
        note: formNote.trim() || undefined,
      }
      if (editingItem) {
        await offDayApi.update(editingItem.id, payload)
        toast.success('Cập nhật ngày nghỉ lễ thành công')
      } else {
        await offDayApi.create(payload)
        toast.success('Thêm ngày nghỉ lễ thành công')
      }
      setIsFormOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (item: OffDay) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await offDayApi.delete(selectedItem.id)
      toast.success('Đã xóa ngày nghỉ lễ')
      setDeleteDialogOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa ngày nghỉ lễ')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ngày nghỉ lễ</h1>
          <p className="text-muted-foreground">Quản lý danh sách ngày nghỉ lễ trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm ngày nghỉ lễ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách ngày nghỉ lễ</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarX className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có ngày nghỉ lễ</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có ngày nghỉ lễ nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm ngày nghỉ lễ đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{new Date(item.offDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{item.note || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(item)}>
                          <Trash2 className="size-4 text-destructive" />
                          <span className="sr-only">Xóa</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Chỉnh sửa ngày nghỉ lễ' : 'Thêm ngày nghỉ lễ mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Tên ngày nghỉ</Label>
              <Input
                id="name"
                placeholder="Nhập tên..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Ngày</Label>
              <Input
                id="date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Input
                id="note"
                placeholder="Nhập ghi chú..."
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Hủy</Button>
              <Button onClick={handleSubmit}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{selectedItem?.name}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
