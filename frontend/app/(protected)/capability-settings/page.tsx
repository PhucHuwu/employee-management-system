'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ListChecks, Minus } from 'lucide-react'
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
import type { CapabilitySetting, CapabilitySettingItem, Capability, Position } from '@/lib/types'
import { capabilitySettingApi, capabilityApi, positionApi } from '@/lib/api/endpoints'

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

interface FormItem {
  id?: string
  capabilityId: string
  coefficient: number
  guideline: string
}

export default function CapabilitySettingsPage() {
  const [capabilitySettings, setCapabilitySettings] = useState<CapabilitySetting[]>([])
  const [capabilities, setCapabilities] = useState<Capability[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCapabilitySetting, setEditingCapabilitySetting] = useState<CapabilitySetting | null>(null)
  const [formUserType, setFormUserType] = useState('')
  const [formPositionId, setFormPositionId] = useState('')
  const [formItems, setFormItems] = useState<FormItem[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCapabilitySetting, setSelectedCapabilitySetting] = useState<CapabilitySetting | null>(null)

  const fetchCapabilitySettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const [settingData, capData, posData] = await Promise.all([
        capabilitySettingApi.getAll({ size: 100 }),
        capabilityApi.getAll({ size: 100 }),
        positionApi.getAll({ size: 100 }),
      ])
      setCapabilitySettings(settingData.items)
      setCapabilities(capData.items)
      setPositions(posData.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách cài đặt năng lực')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCapabilitySettings()
  }, [fetchCapabilitySettings])

  const handleOpenCreate = () => {
    setEditingCapabilitySetting(null)
    setFormUserType('')
    setFormPositionId('')
    setFormItems([])
    setIsFormOpen(true)
  }

  const handleOpenEdit = (setting: CapabilitySetting) => {
    setEditingCapabilitySetting(setting)
    setFormUserType(setting.userType)
    setFormPositionId(setting.positionId)
    setFormItems(
      (setting.items || []).map((item) => ({
        id: item.id,
        capabilityId: item.capabilityId,
        coefficient: item.coefficient,
        guideline: item.guideline || '',
      }))
    )
    setIsFormOpen(true)
  }

  const handleAddItem = () => {
    setFormItems((prev) => [...prev, { capabilityId: '', coefficient: 1, guideline: '' }])
  }

  const handleRemoveItem = (index: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (index: number, field: keyof FormItem, value: string | number) => {
    setFormItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
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
    if (formItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất một mục năng lực')
      return
    }
    for (const item of formItems) {
      if (!item.capabilityId) {
        toast.error('Vui lòng chọn năng lực cho tất cả các mục')
        return
      }
    }
    try {
      const payload = {
        userType: formUserType.trim(),
        positionId: formPositionId,
        items: formItems.map((item) => ({
          capabilityId: item.capabilityId,
          coefficient: item.coefficient,
          guideline: item.guideline.trim() || undefined,
        })),
      }
      if (editingCapabilitySetting) {
        await capabilitySettingApi.update(editingCapabilitySetting.id, payload)
        toast.success('Cập nhật cài đặt năng lực thành công')
      } else {
        await capabilitySettingApi.create(payload)
        toast.success('Thêm cài đặt năng lực thành công')
      }
      setIsFormOpen(false)
      await fetchCapabilitySettings()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (setting: CapabilitySetting) => {
    setSelectedCapabilitySetting(setting)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedCapabilitySetting) return
    try {
      await capabilitySettingApi.delete(selectedCapabilitySetting.id)
      toast.success('Đã xóa cài đặt năng lực')
      setDeleteDialogOpen(false)
      await fetchCapabilitySettings()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa cài đặt năng lực')
    }
  }

  const getPositionName = (id: string) => {
    return positions.find((p) => p.id === id)?.name || id
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cài đặt năng lực</h1>
          <p className="text-muted-foreground">Quản lý danh sách cài đặt năng lực trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm cài đặt năng lực
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách cài đặt năng lực</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : capabilitySettings.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListChecks className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có cài đặt năng lực</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có cài đặt năng lực nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm cài đặt năng lực đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại người dùng</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Số mục</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capabilitySettings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-medium">{setting.userType}</TableCell>
                    <TableCell>{getPositionName(setting.positionId)}</TableCell>
                    <TableCell>{setting.items?.length || 0}</TableCell>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCapabilitySetting ? 'Chỉnh sửa cài đặt năng lực' : 'Thêm cài đặt năng lực mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cs-user-type">Loại người dùng</Label>
              <Input
                id="cs-user-type"
                placeholder="Nhập loại người dùng..."
                value={formUserType}
                onChange={(e) => setFormUserType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cs-position">Vị trí</Label>
              <Select value={formPositionId} onValueChange={setFormPositionId}>
                <SelectTrigger id="cs-position">
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
              <div className="flex items-center justify-between">
                <Label>Danh sách năng lực</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="mr-1 size-3" />
                  Thêm mục
                </Button>
              </div>
              {formItems.length === 0 && (
                <p className="text-sm text-muted-foreground">Chưa có mục năng lực nào.</p>
              )}
              <div className="space-y-3">
                {formItems.map((item, index) => (
                  <div key={index} className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mục {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Minus className="size-3 text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`cs-item-cap-${index}`}>Năng lực</Label>
                      <Select
                        value={item.capabilityId}
                        onValueChange={(v) => handleUpdateItem(index, 'capabilityId', v)}
                      >
                        <SelectTrigger id={`cs-item-cap-${index}`}>
                          <SelectValue placeholder="Chọn năng lực" />
                        </SelectTrigger>
                        <SelectContent>
                          {capabilities.map((cap) => (
                            <SelectItem key={cap.id} value={cap.id}>
                              {cap.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`cs-item-coef-${index}`}>Hệ số</Label>
                      <Input
                        id={`cs-item-coef-${index}`}
                        type="number"
                        step="0.01"
                        placeholder="Nhập hệ số..."
                        value={item.coefficient}
                        onChange={(e) => handleUpdateItem(index, 'coefficient', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`cs-item-guide-${index}`}>Hướng dẫn</Label>
                      <Textarea
                        id={`cs-item-guide-${index}`}
                        placeholder="Nhập hướng dẫn..."
                        value={item.guideline}
                        onChange={(e) => handleUpdateItem(index, 'guideline', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
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
              Bạn có chắc chắn muốn xóa cài đặt năng lực <strong>{selectedCapabilitySetting?.userType}</strong>? Hành động này không thể hoàn tác.
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
