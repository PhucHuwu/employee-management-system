'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react'
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
import type { EducationType } from '@/lib/types'
import { educationTypeApi } from '@/lib/api/endpoints'

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

export default function EducationTypesPage() {
  const [educationTypes, setEducationTypes] = useState<EducationType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEducationType, setEditingEducationType] = useState<EducationType | null>(null)
  const [formName, setFormName] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEducationType, setSelectedEducationType] = useState<EducationType | null>(null)

  const fetchEducationTypes = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await educationTypeApi.getAll({ size: 100 })
      setEducationTypes(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách loại học vấn')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchEducationTypes()
  }, [fetchEducationTypes])

  const handleOpenCreate = () => {
    setEditingEducationType(null)
    setFormName('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (educationType: EducationType) => {
    setEditingEducationType(educationType)
    setFormName(educationType.name)
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên loại học vấn')
      return
    }
    try {
      if (editingEducationType) {
        await educationTypeApi.update(editingEducationType.id, { name: formName.trim() })
        toast.success('Cập nhật loại học vấn thành công')
      } else {
        await educationTypeApi.create({ name: formName.trim() })
        toast.success('Thêm loại học vấn thành công')
      }
      setIsFormOpen(false)
      await fetchEducationTypes()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (educationType: EducationType) => {
    setSelectedEducationType(educationType)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedEducationType) return
    try {
      await educationTypeApi.delete(selectedEducationType.id)
      toast.success('Đã xóa loại học vấn')
      setDeleteDialogOpen(false)
      await fetchEducationTypes()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa loại học vấn')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loại học vấn</h1>
          <p className="text-muted-foreground">Quản lý danh sách loại học vấn trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm loại học vấn
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách loại học vấn</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : educationTypes.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <GraduationCap className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có loại học vấn</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có loại học vấn nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm loại học vấn đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên loại học vấn</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {educationTypes.map((et) => (
                  <TableRow key={et.id}>
                    <TableCell className="font-medium">{et.name}</TableCell>
                    <TableCell>{new Date(et.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(et)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(et)}>
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
            <DialogTitle>{editingEducationType ? 'Chỉnh sửa loại học vấn' : 'Thêm loại học vấn mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="et-name">Tên loại học vấn</Label>
              <Input
                id="et-name"
                placeholder="Nhập tên loại học vấn..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
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
              Bạn có chắc chắn muốn xóa loại học vấn <strong>{selectedEducationType?.name}</strong>? Hành động này không thể hoàn tác.
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
