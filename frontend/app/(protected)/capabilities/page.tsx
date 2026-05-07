'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Award } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import type { Capability, CapabilityType } from '@/lib/types'
import { capabilityApi } from '@/lib/api/endpoints'

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

const CAPABILITY_TYPES: { value: CapabilityType; label: string }[] = [
  { value: 'POINT', label: 'Điểm số' },
  { value: 'TEXT', label: 'Văn bản' },
]

export default function CapabilitiesPage() {
  const [capabilities, setCapabilities] = useState<Capability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCapability, setEditingCapability] = useState<Capability | null>(null)
  const [formName, setFormName] = useState('')
  const [formFrom, setFormFrom] = useState('')
  const [formGuideline, setFormGuideline] = useState('')
  const [formType, setFormType] = useState<CapabilityType>('POINT')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null)

  const fetchCapabilities = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await capabilityApi.getAll({ size: 100 })
      setCapabilities(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách năng lực')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCapabilities()
  }, [fetchCapabilities])

  const handleOpenCreate = () => {
    setEditingCapability(null)
    setFormName('')
    setFormFrom('')
    setFormGuideline('')
    setFormType('POINT')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (capability: Capability) => {
    setEditingCapability(capability)
    setFormName(capability.name)
    setFormFrom(capability.from || '')
    setFormGuideline(capability.guideline || '')
    setFormType(capability.type)
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên năng lực')
      return
    }
    try {
      const payload = {
        name: formName.trim(),
        from: formFrom.trim() || undefined,
        guideline: formGuideline.trim() || undefined,
        type: formType,
      }
      if (editingCapability) {
        await capabilityApi.update(editingCapability.id, payload)
        toast.success('Cập nhật năng lực thành công')
      } else {
        await capabilityApi.create(payload)
        toast.success('Thêm năng lực thành công')
      }
      setIsFormOpen(false)
      await fetchCapabilities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (capability: Capability) => {
    setSelectedCapability(capability)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedCapability) return
    try {
      await capabilityApi.delete(selectedCapability.id)
      toast.success('Đã xóa năng lực')
      setDeleteDialogOpen(false)
      await fetchCapabilities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa năng lực')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Năng lực</h1>
          <p className="text-muted-foreground">Quản lý danh sách năng lực trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm năng lực
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách năng lực</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : capabilities.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Award className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có năng lực</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có năng lực nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm năng lực đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên năng lực</TableHead>
                  <TableHead>Từ</TableHead>
                  <TableHead>Hướng dẫn</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capabilities.map((cap) => (
                  <TableRow key={cap.id}>
                    <TableCell className="font-medium">{cap.name}</TableCell>
                    <TableCell>{cap.from || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>{cap.guideline || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      {cap.type === 'POINT' ? 'Điểm số' : 'Văn bản'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(cap)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(cap)}>
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
            <DialogTitle>{editingCapability ? 'Chỉnh sửa năng lực' : 'Thêm năng lực mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cap-name">Tên năng lực</Label>
              <Input
                id="cap-name"
                placeholder="Nhập tên năng lực..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cap-from">Từ</Label>
              <Input
                id="cap-from"
                placeholder="Nhập từ..."
                value={formFrom}
                onChange={(e) => setFormFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cap-guideline">Hướng dẫn</Label>
              <Textarea
                id="cap-guideline"
                placeholder="Nhập hướng dẫn..."
                value={formGuideline}
                onChange={(e) => setFormGuideline(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cap-type">Loại</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as CapabilityType)}>
                <SelectTrigger id="cap-type">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {CAPABILITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Bạn có chắc chắn muốn xóa năng lực <strong>{selectedCapability?.name}</strong>? Hành động này không thể hoàn tác.
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
