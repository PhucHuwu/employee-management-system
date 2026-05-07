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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PositionSetting, SubPosition } from '@/lib/types'
import { positionSettingApi, subPositionApi } from '@/lib/api/endpoints'

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

export default function PositionSettingsPage() {
  const [positionSettings, setPositionSettings] = useState<PositionSetting[]>([])
  const [subPositions, setSubPositions] = useState<SubPosition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPositionSetting, setEditingPositionSetting] = useState<PositionSetting | null>(null)
  const [formUserType, setFormUserType] = useState('')
  const [formLmsConfig, setFormLmsConfig] = useState('')
  const [formSubPositionId, setFormSubPositionId] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPositionSetting, setSelectedPositionSetting] = useState<PositionSetting | null>(null)

  const fetchPositionSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const [psData, spData] = await Promise.all([
        positionSettingApi.getAll({ size: 100 }),
        subPositionApi.getAll({ size: 100 }),
      ])
      setPositionSettings(psData.items)
      setSubPositions(spData.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách cài đặt vị trí')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPositionSettings()
  }, [fetchPositionSettings])

  const handleOpenCreate = () => {
    setEditingPositionSetting(null)
    setFormUserType('')
    setFormLmsConfig('')
    setFormSubPositionId('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (positionSetting: PositionSetting) => {
    setEditingPositionSetting(positionSetting)
    setFormUserType(positionSetting.userType)
    setFormLmsConfig(positionSetting.lmsConfig || '')
    setFormSubPositionId(positionSetting.subPositionId)
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formUserType.trim()) {
      toast.error('Vui lòng nhập loại người dùng')
      return
    }
    if (!formSubPositionId) {
      toast.error('Vui lòng chọn vị trí phụ')
      return
    }
    try {
      const payload = {
        userType: formUserType.trim(),
        lmsConfig: formLmsConfig.trim() || undefined,
        subPositionId: formSubPositionId,
      }
      if (editingPositionSetting) {
        await positionSettingApi.update(editingPositionSetting.id, payload)
        toast.success('Cập nhật cài đặt vị trí thành công')
      } else {
        await positionSettingApi.create(payload)
        toast.success('Thêm cài đặt vị trí thành công')
      }
      setIsFormOpen(false)
      await fetchPositionSettings()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (positionSetting: PositionSetting) => {
    setSelectedPositionSetting(positionSetting)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedPositionSetting) return
    try {
      await positionSettingApi.delete(selectedPositionSetting.id)
      toast.success('Đã xóa cài đặt vị trí')
      setDeleteDialogOpen(false)
      await fetchPositionSettings()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa cài đặt vị trí')
    }
  }

  const getSubPositionName = (id: string) => {
    return subPositions.find((sp) => sp.id === id)?.name || id
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cài đặt vị trí</h1>
          <p className="text-muted-foreground">Quản lý danh sách cài đặt vị trí trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm cài đặt vị trí
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách cài đặt vị trí</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : positionSettings.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Settings className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có cài đặt vị trí</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có cài đặt vị trí nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm cài đặt vị trí đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại người dùng</TableHead>
                  <TableHead>Vị trí phụ</TableHead>
                  <TableHead>Cấu hình LMS</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positionSettings.map((ps) => (
                  <TableRow key={ps.id}>
                    <TableCell className="font-medium">{ps.userType}</TableCell>
                    <TableCell>{getSubPositionName(ps.subPositionId)}</TableCell>
                    <TableCell>{ps.lmsConfig || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(ps)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(ps)}>
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
            <DialogTitle>{editingPositionSetting ? 'Chỉnh sửa cài đặt vị trí' : 'Thêm cài đặt vị trí mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ps-user-type">Loại người dùng</Label>
              <Input
                id="ps-user-type"
                placeholder="Nhập loại người dùng..."
                value={formUserType}
                onChange={(e) => setFormUserType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ps-sub-position">Vị trí phụ</Label>
              <Select value={formSubPositionId} onValueChange={setFormSubPositionId}>
                <SelectTrigger id="ps-sub-position">
                  <SelectValue placeholder="Chọn vị trí phụ" />
                </SelectTrigger>
                <SelectContent>
                  {subPositions.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ps-lms">Cấu hình LMS</Label>
              <Input
                id="ps-lms"
                placeholder="Nhập cấu hình LMS..."
                value={formLmsConfig}
                onChange={(e) => setFormLmsConfig(e.target.value)}
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
              Bạn có chắc chắn muốn xóa cài đặt vị trí <strong>{selectedPositionSetting?.userType}</strong>? Hành động này không thể hoàn tác.
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
