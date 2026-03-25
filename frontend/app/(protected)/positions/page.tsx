'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Briefcase } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { Position } from '@/lib/types'
import { PositionForm } from '@/components/positions/position-form'
import { positionApi } from '@/lib/api/endpoints'

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchPositions = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await positionApi.getAll({ size: 100 })
      setPositions(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách vị trí')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPositions()
  }, [fetchPositions])

  const filteredPositions = useMemo(
    () => positions.filter((pos) => pos.name.toLowerCase().includes(searchKeyword.toLowerCase())),
    [positions, searchKeyword]
  )

  const handleDelete = async () => {
    if (!selectedPosition) return

    try {
      await positionApi.delete(selectedPosition.id)
      toast.success('Đã xóa vị trí thành công')
      setDeleteDialogOpen(false)
      setSelectedPosition(null)
      setDeleteError(null)
      await fetchPositions()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa vị trí'
      setDeleteError(message)
    }
  }

  const handleOpenDelete = (position: Position) => {
    setSelectedPosition(position)
    setDeleteError(null)
    setDeleteDialogOpen(true)
  }

  const handleOpenEdit = (position: Position) => {
    setEditingPosition(position)
    setIsFormOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingPosition(null)
    setIsFormOpen(true)
  }

  const handleFormSuccess = async () => {
    setIsFormOpen(false)
    setEditingPosition(null)
    toast.success(editingPosition ? 'Cập nhật vị trí thành công' : 'Thêm vị trí thành công')
    await fetchPositions()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vị trí</h1>
          <p className="text-muted-foreground">Quản lý danh sách vị trí công việc</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm vị trí
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-5" />
            Danh sách vị trí
          </CardTitle>
          <CardDescription>Các vị trí công việc trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm vị trí..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : filteredPositions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Briefcase className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Không có vị trí</EmptyTitle>
                <EmptyDescription>
                  {searchKeyword ? 'Không tìm thấy vị trí phù hợp' : 'Chưa có vị trí nào trong hệ thống'}
                </EmptyDescription>
              </EmptyHeader>
              {!searchKeyword && (
                <Button onClick={handleOpenCreate} className="mt-4">
                  <Plus className="mr-2 size-4" />
                  Thêm vị trí đầu tiên
                </Button>
              )}
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên vị trí</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.name}</TableCell>
                    <TableCell className="text-muted-foreground">{position.description || '-'}</TableCell>
                    <TableCell>{new Date(position.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(position)}>
                            <Pencil className="mr-2 size-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDelete(position)} className="text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeleteError(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa vị trí</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vị trí <strong>{selectedPosition?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{deleteError}</div>}
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPosition ? 'Chỉnh sửa vị trí' : 'Thêm vị trí mới'}</DialogTitle>
          </DialogHeader>
          <PositionForm position={editingPosition} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
