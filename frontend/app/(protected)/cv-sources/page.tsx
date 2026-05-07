'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
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
import type { CVSource } from '@/lib/types'
import { cvSourceApi } from '@/lib/api/endpoints'

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

export default function CVSourcesPage() {
  const [cvSources, setCvSources] = useState<CVSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCVSource, setEditingCVSource] = useState<CVSource | null>(null)
  const [formName, setFormName] = useState('')
  const [formColor, setFormColor] = useState('')
  const [formReferenceTo, setFormReferenceTo] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCVSource, setSelectedCVSource] = useState<CVSource | null>(null)

  const fetchCVSources = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await cvSourceApi.getAll({ size: 100 })
      setCvSources(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách nguồn CV')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCVSources()
  }, [fetchCVSources])

  const handleOpenCreate = () => {
    setEditingCVSource(null)
    setFormName('')
    setFormColor('')
    setFormReferenceTo('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (cvSource: CVSource) => {
    setEditingCVSource(cvSource)
    setFormName(cvSource.name)
    setFormColor(cvSource.color || '')
    setFormReferenceTo(cvSource.referenceTo || '')
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên nguồn CV')
      return
    }
    try {
      const payload = {
        name: formName.trim(),
        color: formColor.trim() || undefined,
        referenceTo: formReferenceTo.trim() || undefined,
      }
      if (editingCVSource) {
        await cvSourceApi.update(editingCVSource.id, payload)
        toast.success('Cập nhật nguồn CV thành công')
      } else {
        await cvSourceApi.create(payload)
        toast.success('Thêm nguồn CV thành công')
      }
      setIsFormOpen(false)
      await fetchCVSources()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (cvSource: CVSource) => {
    setSelectedCVSource(cvSource)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedCVSource) return
    try {
      await cvSourceApi.delete(selectedCVSource.id)
      toast.success('Đã xóa nguồn CV')
      setDeleteDialogOpen(false)
      await fetchCVSources()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa nguồn CV')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nguồn CV</h1>
          <p className="text-muted-foreground">Quản lý danh sách nguồn CV trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm nguồn CV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nguồn CV</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : cvSources.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có nguồn CV</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có nguồn CV nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm nguồn CV đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên nguồn CV</TableHead>
                  <TableHead>Màu</TableHead>
                  <TableHead>Tham chiếu</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cvSources.map((cv) => (
                  <TableRow key={cv.id}>
                    <TableCell className="font-medium">{cv.name}</TableCell>
                    <TableCell>
                      {cv.color ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block size-4 rounded-full border"
                            style={{ backgroundColor: cv.color }}
                          />
                          <span className="text-muted-foreground text-xs">{cv.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{cv.referenceTo || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(cv)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(cv)}>
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
            <DialogTitle>{editingCVSource ? 'Chỉnh sửa nguồn CV' : 'Thêm nguồn CV mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cv-name">Tên nguồn CV</Label>
              <Input
                id="cv-name"
                placeholder="Nhập tên nguồn CV..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cv-color">Màu sắc</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cv-color"
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
            <div className="space-y-2">
              <Label htmlFor="cv-reference">Tham chiếu</Label>
              <Input
                id="cv-reference"
                placeholder="Nhập tham chiếu..."
                value={formReferenceTo}
                onChange={(e) => setFormReferenceTo(e.target.value)}
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
              Bạn có chắc chắn muốn xóa nguồn CV <strong>{selectedCVSource?.name}</strong>? Hành động này không thể hoàn tác.
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
