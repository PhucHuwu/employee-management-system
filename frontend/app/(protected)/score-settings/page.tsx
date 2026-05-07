'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, BarChart3 } from 'lucide-react'
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
import type { ScoreSetting, Position } from '@/lib/types'
import { scoreSettingApi, positionApi } from '@/lib/api/endpoints'

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

export default function ScoreSettingsPage() {
  const [scoreSettings, setScoreSettings] = useState<ScoreSetting[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingScoreSetting, setEditingScoreSetting] = useState<ScoreSetting | null>(null)
  const [formUserType, setFormUserType] = useState('')
  const [formPositionId, setFormPositionId] = useState('')
  const [formScoreFrom, setFormScoreFrom] = useState('')
  const [formScoreTo, setFormScoreTo] = useState('')
  const [formLevel, setFormLevel] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedScoreSetting, setSelectedScoreSetting] = useState<ScoreSetting | null>(null)

  const fetchScoreSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const [settingData, posData] = await Promise.all([
        scoreSettingApi.getAll({ size: 100 }),
        positionApi.getAll({ size: 100 }),
      ])
      setScoreSettings(settingData.items)
      setPositions(posData.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách cài đặt điểm')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchScoreSettings()
  }, [fetchScoreSettings])

  const handleOpenCreate = () => {
    setEditingScoreSetting(null)
    setFormUserType('')
    setFormPositionId('')
    setFormScoreFrom('')
    setFormScoreTo('')
    setFormLevel('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (setting: ScoreSetting) => {
    setEditingScoreSetting(setting)
    setFormUserType(setting.userType)
    setFormPositionId(setting.positionId)
    setFormScoreFrom(String(setting.scoreFrom))
    setFormScoreTo(String(setting.scoreTo))
    setFormLevel(setting.level)
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formUserType.trim()) {
      toast.error('Vui lòng nhập loại người dùng')
      return
    }
    if (!formPositionId) {
      toast.error('Vui lòng chọn vị trí')
      return
    }
    if (formScoreFrom.trim() === '' || formScoreTo.trim() === '') {
      toast.error('Vui lòng nhập điểm từ và điểm đến')
      return
    }
    if (!formLevel.trim()) {
      toast.error('Vui lòng nhập cấp độ')
      return
    }
    try {
      const payload = {
        userType: formUserType.trim(),
        positionId: formPositionId,
        scoreFrom: parseFloat(formScoreFrom),
        scoreTo: parseFloat(formScoreTo),
        level: formLevel.trim(),
      }
      if (editingScoreSetting) {
        await scoreSettingApi.update(editingScoreSetting.id, payload)
        toast.success('Cập nhật cài đặt điểm thành công')
      } else {
        await scoreSettingApi.create(payload)
        toast.success('Thêm cài đặt điểm thành công')
      }
      setIsFormOpen(false)
      await fetchScoreSettings()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (setting: ScoreSetting) => {
    setSelectedScoreSetting(setting)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedScoreSetting) return
    try {
      await scoreSettingApi.delete(selectedScoreSetting.id)
      toast.success('Đã xóa cài đặt điểm')
      setDeleteDialogOpen(false)
      await fetchScoreSettings()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa cài đặt điểm')
    }
  }

  const getPositionName = (id: string) => {
    return positions.find((p) => p.id === id)?.name || id
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cài đặt điểm</h1>
          <p className="text-muted-foreground">Quản lý danh sách cài đặt điểm trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm cài đặt điểm
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách cài đặt điểm</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : scoreSettings.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BarChart3 className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có cài đặt điểm</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có cài đặt điểm nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm cài đặt điểm đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại người dùng</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Điểm từ</TableHead>
                  <TableHead>Điểm đến</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scoreSettings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-medium">{setting.userType}</TableCell>
                    <TableCell>{getPositionName(setting.positionId)}</TableCell>
                    <TableCell>{setting.scoreFrom}</TableCell>
                    <TableCell>{setting.scoreTo}</TableCell>
                    <TableCell>{setting.level}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(setting)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(setting)}>
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
            <DialogTitle>{editingScoreSetting ? 'Chỉnh sửa cài đặt điểm' : 'Thêm cài đặt điểm mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ss-user-type">Loại người dùng</Label>
              <Input
                id="ss-user-type"
                placeholder="Nhập loại người dùng..."
                value={formUserType}
                onChange={(e) => setFormUserType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss-position">Vị trí</Label>
              <Select value={formPositionId} onValueChange={setFormPositionId}>
                <SelectTrigger id="ss-position">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ss-score-from">Điểm từ</Label>
                <Input
                  id="ss-score-from"
                  type="number"
                  step="0.01"
                  placeholder="Nhập điểm từ..."
                  value={formScoreFrom}
                  onChange={(e) => setFormScoreFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ss-score-to">Điểm đến</Label>
                <Input
                  id="ss-score-to"
                  type="number"
                  step="0.01"
                  placeholder="Nhập điểm đến..."
                  value={formScoreTo}
                  onChange={(e) => setFormScoreTo(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss-level">Cấp độ</Label>
              <Input
                id="ss-level"
                placeholder="Nhập cấp độ..."
                value={formLevel}
                onChange={(e) => setFormLevel(e.target.value)}
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
              Bạn có chắc chắn muốn xóa cài đặt điểm <strong>{selectedScoreSetting?.userType}</strong>? Hành động này không thể hoàn tác.
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
