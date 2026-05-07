'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ListTodo } from 'lucide-react'
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
import type { ProjectTask } from '@/lib/types'
import { projectTaskApi } from '@/lib/api/endpoints'

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

export default function ProjectTasksPage() {
  const [items, setItems] = useState<ProjectTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProjectTask | null>(null)
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ProjectTask | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await projectTaskApi.getAll({ size: 100 })
      setItems(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách task')
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
    setFormCode('')
    setFormDescription('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: ProjectTask) => {
    setEditingItem(item)
    setFormName(item.name)
    setFormCode(item.code)
    setFormDescription(item.description || '')
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên task')
      return
    }
    if (!formCode.trim()) {
      toast.error('Vui lòng nhập mã task')
      return
    }
    try {
      const payload = {
        name: formName.trim(),
        code: formCode.trim(),
        description: formDescription.trim() || undefined,
      }
      if (editingItem) {
        await projectTaskApi.update(editingItem.id, payload)
        toast.success('Cập nhật task thành công')
      } else {
        await projectTaskApi.create(payload)
        toast.success('Thêm task thành công')
      }
      setIsFormOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (item: ProjectTask) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await projectTaskApi.delete(selectedItem.id)
      toast.success('Đã xóa task')
      setDeleteDialogOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa task')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Tasks</h1>
          <p className="text-muted-foreground">Quản lý danh sách task dự án</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách task</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListTodo className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có task</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có task nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm task đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description || <span className="text-muted-foreground">-</span>}</TableCell>
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
            <DialogTitle>{editingItem ? 'Chỉnh sửa task' : 'Thêm task mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="code">Mã task</Label>
              <Input
                id="code"
                placeholder="Nhập mã..."
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Tên task</Label>
              <Input
                id="name"
                placeholder="Nhập tên..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                placeholder="Nhập mô tả..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
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
              Bạn có chắc chắn muốn xóa task <strong>{selectedItem?.name}</strong>? Hành động này không thể hoàn tác.
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
