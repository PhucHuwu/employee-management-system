'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react'
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
import type { Branch } from '@/lib/types'
import { branchApi } from '@/lib/api/endpoints'

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

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formName, setFormName] = useState('')
  const [formDisplayName, setFormDisplayName] = useState('')
  const [formColor, setFormColor] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

  const fetchBranches = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await branchApi.getAll({ size: 100 })
      setBranches(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách chi nhánh')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchBranches()
  }, [fetchBranches])

  const handleOpenCreate = () => {
    setEditingBranch(null)
    setFormName('')
    setFormDisplayName('')
    setFormColor('')
    setFormAddress('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setFormName(branch.name)
    setFormDisplayName(branch.displayName)
    setFormColor(branch.color || '')
    setFormAddress(branch.address || '')
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên chi nhánh')
      return
    }
    if (!formDisplayName.trim()) {
      toast.error('Vui lòng nhập tên hiển thị')
      return
    }
    try {
      const payload = {
        name: formName.trim(),
        displayName: formDisplayName.trim(),
        color: formColor.trim() || undefined,
        address: formAddress.trim() || undefined,
      }
      if (editingBranch) {
        await branchApi.update(editingBranch.id, payload)
        toast.success('Cập nhật chi nhánh thành công')
      } else {
        await branchApi.create(payload)
        toast.success('Thêm chi nhánh thành công')
      }
      setIsFormOpen(false)
      await fetchBranches()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (branch: Branch) => {
    setSelectedBranch(branch)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedBranch) return
    try {
      await branchApi.delete(selectedBranch.id)
      toast.success('Đã xóa chi nhánh')
      setDeleteDialogOpen(false)
      await fetchBranches()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa chi nhánh')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chi nhánh</h1>
          <p className="text-muted-foreground">Quản lý danh sách chi nhánh trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm chi nhánh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chi nhánh</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : branches.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MapPin className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có chi nhánh</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có chi nhánh nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm chi nhánh đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên chi nhánh</TableHead>
                  <TableHead>Tên hiển thị</TableHead>
                  <TableHead>Màu</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.displayName}</TableCell>
                    <TableCell>
                      {branch.color ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block size-4 rounded-full border"
                            style={{ backgroundColor: branch.color }}
                          />
                          <span className="text-muted-foreground text-xs">{branch.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{branch.address || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(branch)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(branch)}>
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
            <DialogTitle>{editingBranch ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Tên chi nhánh</Label>
              <Input
                id="branch-name"
                placeholder="Nhập tên chi nhánh..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-display-name">Tên hiển thị</Label>
              <Input
                id="branch-display-name"
                placeholder="Nhập tên hiển thị..."
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-color">Màu sắc</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="branch-color"
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
              <Label htmlFor="branch-address">Địa chỉ</Label>
              <Input
                id="branch-address"
                placeholder="Nhập địa chỉ..."
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
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
              Bạn có chắc chắn muốn xóa chi nhánh <strong>{selectedBranch?.name}</strong>? Hành động này không thể hoàn tác.
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
