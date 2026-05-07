'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Education, EducationType } from '@/lib/types'
import { educationApi, educationTypeApi } from '@/lib/api/endpoints'

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

export default function EducationsPage() {
  const [educations, setEducations] = useState<Education[]>([])
  const [educationTypes, setEducationTypes] = useState<EducationType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEducation, setEditingEducation] = useState<Education | null>(null)
  const [formName, setFormName] = useState('')
  const [formColor, setFormColor] = useState('')
  const [formEducationTypeId, setFormEducationTypeId] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null)

  const fetchEducations = useCallback(async () => {
    setIsLoading(true)
    try {
      const [eduData, typeData] = await Promise.all([
        educationApi.getAll({ size: 100 }),
        educationTypeApi.getAll({ size: 100 }),
      ])
      setEducations(eduData.items)
      setEducationTypes(typeData.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách học vấn')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchEducations()
  }, [fetchEducations])

  const handleOpenCreate = () => {
    setEditingEducation(null)
    setFormName('')
    setFormColor('')
    setFormEducationTypeId('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (education: Education) => {
    setEditingEducation(education)
    setFormName(education.name)
    setFormColor(education.color || '')
    setFormEducationTypeId(education.educationTypeId)
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên học vấn')
      return
    }
    if (!formEducationTypeId) {
      toast.error('Vui lòng chọn loại học vấn')
      return
    }
    try {
      const payload = {
        name: formName.trim(),
        color: formColor.trim() || undefined,
        educationTypeId: formEducationTypeId,
      }
      if (editingEducation) {
        await educationApi.update(editingEducation.id, payload)
        toast.success('Cập nhật học vấn thành công')
      } else {
        await educationApi.create(payload)
        toast.success('Thêm học vấn thành công')
      }
      setIsFormOpen(false)
      await fetchEducations()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (education: Education) => {
    setSelectedEducation(education)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedEducation) return
    try {
      await educationApi.delete(selectedEducation.id)
      toast.success('Đã xóa học vấn')
      setDeleteDialogOpen(false)
      await fetchEducations()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa học vấn')
    }
  }

  const getEducationTypeName = (id: string) => {
    return educationTypes.find((t) => t.id === id)?.name || id
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Học vấn</h1>
          <p className="text-muted-foreground">Quản lý danh sách học vấn trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm học vấn
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách học vấn</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : educations.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có học vấn</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có học vấn nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm học vấn đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên học vấn</TableHead>
                  <TableHead>Loại học vấn</TableHead>
                  <TableHead>Màu</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {educations.map((edu) => (
                  <TableRow key={edu.id}>
                    <TableCell className="font-medium">{edu.name}</TableCell>
                    <TableCell>{getEducationTypeName(edu.educationTypeId)}</TableCell>
                    <TableCell>
                      {edu.color ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block size-4 rounded-full border"
                            style={{ backgroundColor: edu.color }}
                          />
                          <span className="text-muted-foreground text-xs">{edu.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(edu)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(edu)}>
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
            <DialogTitle>{editingEducation ? 'Chỉnh sửa học vấn' : 'Thêm học vấn mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edu-name">Tên học vấn</Label>
              <Input
                id="edu-name"
                placeholder="Nhập tên học vấn..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-type">Loại học vấn</Label>
              <Select value={formEducationTypeId} onValueChange={setFormEducationTypeId}>
                <SelectTrigger id="edu-type">
                  <SelectValue placeholder="Chọn loại học vấn" />
                </SelectTrigger>
                <SelectContent>
                  {educationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-color">Màu sắc</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edu-color"
                  type="color"
                  value={formColor || '#000000'}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-12 p-1"
                />
                <Input
                  placeholder="#hex hoặc tên màu"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="flex-1"
                />
              </div>
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
              Bạn có chắc chắn muốn xóa học vấn <strong>{selectedEducation?.name}</strong>? Hành động này không thể hoàn tác.
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
