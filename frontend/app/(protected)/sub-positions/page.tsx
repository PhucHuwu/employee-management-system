'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Layers } from 'lucide-react'
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
import type { SubPosition, Position } from '@/lib/types'
import { subPositionApi, positionApi } from '@/lib/api/endpoints'

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

export default function SubPositionsPage() {
  const [subPositions, setSubPositions] = useState<SubPosition[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSubPosition, setEditingSubPosition] = useState<SubPosition | null>(null)
  const [formName, setFormName] = useState('')
  const [formColor, setFormColor] = useState('')
  const [formPositionId, setFormPositionId] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSubPosition, setSelectedSubPosition] = useState<SubPosition | null>(null)

  const fetchSubPositions = useCallback(async () => {
    setIsLoading(true)
    try {
      const [spData, posData] = await Promise.all([
        subPositionApi.getAll({ size: 100 }),
        positionApi.getAll({ size: 100 }),
      ])
      setSubPositions(spData.items)
      setPositions(posData.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách vị trí phụ')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSubPositions()
  }, [fetchSubPositions])

  const handleOpenCreate = () => {
    setEditingSubPosition(null)
    setFormName('')
    setFormColor('')
    setFormPositionId('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (subPosition: SubPosition) => {
    setEditingSubPosition(subPosition)
    setFormName(subPosition.name)
    setFormColor(subPosition.color || '')
    setFormPositionId(subPosition.positionId)
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên vị trí phụ')
      return
    }
    if (!formPositionId) {
      toast.error('Vui lòng chọn vị trí')
      return
    }
    try {
      const payload = {
        name: formName.trim(),
        color: formColor.trim() || undefined,
        positionId: formPositionId,
      }
      if (editingSubPosition) {
        await subPositionApi.update(editingSubPosition.id, payload)
        toast.success('Cập nhật vị trí phụ thành công')
      } else {
        await subPositionApi.create(payload)
        toast.success('Thêm vị trí phụ thành công')
      }
      setIsFormOpen(false)
      await fetchSubPositions()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (subPosition: SubPosition) => {
    setSelectedSubPosition(subPosition)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedSubPosition) return
    try {
      await subPositionApi.delete(selectedSubPosition.id)
      toast.success('Đã xóa vị trí phụ')
      setDeleteDialogOpen(false)
      await fetchSubPositions()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa vị trí phụ')
    }
  }

  const getPositionName = (id: string) => {
    return positions.find((p) => p.id === id)?.name || id
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vị trí phụ</h1>
          <p className="text-muted-foreground">Quản lý danh sách vị trí phụ trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm vị trí phụ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách vị trí phụ</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : subPositions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Layers className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có vị trí phụ</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có vị trí phụ nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm vị trí phụ đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên vị trí phụ</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Màu</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subPositions.map((sp) => (
                  <TableRow key={sp.id}>
                    <TableCell className="font-medium">{sp.name}</TableCell>
                    <TableCell>{getPositionName(sp.positionId)}</TableCell>
                    <TableCell>
                      {sp.color ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block size-4 rounded-full border"
                            style={{ backgroundColor: sp.color }}
                          />
                          <span className="text-muted-foreground text-xs">{sp.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(sp)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(sp)}>
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
            <DialogTitle>{editingSubPosition ? 'Chỉnh sửa vị trí phụ' : 'Thêm vị trí phụ mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sp-name">Tên vị trí phụ</Label>
              <Input
                id="sp-name"
                placeholder="Nhập tên vị trí phụ..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sp-position">Vị trí</Label>
              <Select value={formPositionId} onValueChange={setFormPositionId}>
                <SelectTrigger id="sp-position">
                  <SelectValue placeholder="Chọn vị trí" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sp-color">Màu sắc</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="sp-color"
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
              Bạn có chắc chắn muốn xóa vị trí phụ <strong>{selectedSubPosition?.name}</strong>? Hành động này không thể hoàn tác.
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
