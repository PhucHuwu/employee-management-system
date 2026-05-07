'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Settings } from 'lucide-react'
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
import type { SystemSetting } from '@/lib/types'
import { systemSettingApi } from '@/lib/api/endpoints'

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

export default function SystemSettingsPage() {
  const [items, setItems] = useState<SystemSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SystemSetting | null>(null)
  const [formKey, setFormKey] = useState('')
  const [formValue, setFormValue] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SystemSetting | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await systemSettingApi.getAll({ size: 100 })
      setItems(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách cài đặt')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormKey('')
    setFormValue('')
    setFormCategory('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: SystemSetting) => {
    setEditingItem(item)
    setFormKey(item.key)
    setFormValue(item.value)
    setFormCategory(item.category)
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formKey.trim()) {
      toast.error('Vui lòng nhập key')
      return
    }
    if (!formValue.trim()) {
      toast.error('Vui lòng nhập giá trị')
      return
    }
    try {
      const payload = {
        key: formKey.trim(),
        value: formValue.trim(),
        category: formCategory.trim() || undefined,
      }
      if (editingItem) {
        await systemSettingApi.update(editingItem.id, payload)
        toast.success('Cập nhật cài đặt thành công')
      } else {
        await systemSettingApi.create(payload)
        toast.success('Thêm cài đặt thành công')
      }
      setIsFormOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (item: SystemSetting) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await systemSettingApi.delete(selectedItem.id)
      toast.success('Đã xóa cài đặt')
      setDeleteDialogOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa cài đặt')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground">Quản lý cấu hình hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm cài đặt
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách cài đặt</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Settings className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có cài đặt</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có cài đặt nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm cài đặt đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.key}</TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>{item.category || <span className="text-muted-foreground">-</span>}</TableCell>
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
            <DialogTitle>{editingItem ? 'Chỉnh sửa cài đặt' : 'Thêm cài đặt mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                placeholder="Nhập key..."
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                disabled={!!editingItem}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Giá trị</Label>
              <Input
                id="value"
                placeholder="Nhập giá trị..."
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Danh mục</Label>
              <Input
                id="category"
                placeholder="Nhập danh mục..."
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
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
              Bạn có chắc chắn muốn xóa cài đặt <strong>{selectedItem?.key}</strong>? Hành động này không thể hoàn tác.
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
