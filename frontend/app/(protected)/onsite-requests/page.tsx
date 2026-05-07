'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ClipboardList } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type OnsiteRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type OnsitePeriod = 'FULL_DAY' | 'MORNING' | 'AFTERNOON' | 'HOURS'

export interface OnsiteRequest {
  id: string
  requestDate: string
  period: OnsitePeriod
  hours?: number | null
  reason?: string
  status: OnsiteRequestStatus
  createdAt: string
  updatedAt: string
}

const statusLabels: Record<OnsiteRequestStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
}

const periodLabels: Record<OnsitePeriod, string> = {
  FULL_DAY: 'Cả ngày',
  MORNING: 'Buổi sáng',
  AFTERNOON: 'Buổi chiều',
  HOURS: 'Theo giờ',
}

function getStatusBadge(status: OnsiteRequestStatus) {
  switch (status) {
    case 'PENDING':
      return <Badge className="bg-amber-500 text-white hover:bg-amber-500/90">{statusLabels.PENDING}</Badge>
    case 'APPROVED':
      return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">{statusLabels.APPROVED}</Badge>
    case 'REJECTED':
      return <Badge variant="destructive">{statusLabels.REJECTED}</Badge>
    case 'CANCELLED':
      return <Badge variant="secondary">{statusLabels.CANCELLED}</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="ml-auto h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

async function fetchOnsiteRequests(): Promise<OnsiteRequest[]> {
  const res = await fetch(`${API_BASE_URL}/onsite-requests`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : ''}`,
    },
  })
  if (!res.ok) {
    throw new Error('Không tải được danh sách onsite')
  }
  const data = await res.json()
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.items)) return data.items
  if (data && Array.isArray(data.data)) return data.data
  return []
}

async function createOnsiteRequest(payload: Omit<OnsiteRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<OnsiteRequest> {
  const res = await fetch(`${API_BASE_URL}/onsite-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : ''}`,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Thao tác thất bại' }))
    throw new Error(err.message || 'Thao tác thất bại')
  }
  return res.json()
}

async function updateOnsiteRequest(id: string, payload: Partial<Omit<OnsiteRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>>): Promise<OnsiteRequest> {
  const res = await fetch(`${API_BASE_URL}/onsite-requests/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : ''}`,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Thao tác thất bại' }))
    throw new Error(err.message || 'Thao tác thất bại')
  }
  return res.json()
}

async function deleteOnsiteRequest(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/onsite-requests/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : ''}`,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Không thể xóa' }))
    throw new Error(err.message || 'Không thể xóa')
  }
}

export default function OnsiteRequestsPage() {
  const [items, setItems] = useState<OnsiteRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OnsiteRequest | null>(null)
  const [formRequestDate, setFormRequestDate] = useState('')
  const [formPeriod, setFormPeriod] = useState<OnsitePeriod>('FULL_DAY')
  const [formHours, setFormHours] = useState('')
  const [formReason, setFormReason] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<OnsiteRequest | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchOnsiteRequests()
      setItems(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách onsite')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormRequestDate('')
    setFormPeriod('FULL_DAY')
    setFormHours('')
    setFormReason('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: OnsiteRequest) => {
    setEditingItem(item)
    setFormRequestDate(item.requestDate.split('T')[0])
    setFormPeriod(item.period)
    setFormHours(item.hours != null ? String(item.hours) : '')
    setFormReason(item.reason || '')
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formRequestDate.trim()) {
      toast.error('Vui lòng chọn ngày')
      return
    }
    if (!formPeriod.trim()) {
      toast.error('Vui lòng chọn ca làm')
      return
    }
    try {
      const payload = {
        requestDate: new Date(formRequestDate).toISOString(),
        period: formPeriod,
        hours: formPeriod === 'HOURS' ? (Number(formHours) || 0) : undefined,
        reason: formReason.trim() || undefined,
      }
      if (editingItem) {
        await updateOnsiteRequest(editingItem.id, payload)
        toast.success('Cập nhật thành công')
      } else {
        await createOnsiteRequest(payload as Omit<OnsiteRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>)
        toast.success('Thêm thành công')
      }
      setIsFormOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (item: OnsiteRequest) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await deleteOnsiteRequest(selectedItem.id)
      toast.success('Đã xóa')
      setDeleteDialogOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Yêu cầu onsite</h1>
          <p className="text-muted-foreground">Quản lý các yêu cầu làm việc onsite</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm yêu cầu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu onsite</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardList className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có yêu cầu</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có yêu cầu onsite nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm yêu cầu đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Ca làm</TableHead>
                  <TableHead>Số giờ</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {new Date(item.requestDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>{periodLabels[item.period] || item.period}</TableCell>
                    <TableCell>{item.hours != null ? `${item.hours}h` : '-'}</TableCell>
                    <TableCell>{item.reason || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(item)}>
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
            <DialogTitle>{editingItem ? 'Chỉnh sửa yêu cầu onsite' : 'Thêm yêu cầu onsite mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="requestDate">Ngày</Label>
              <Input
                id="requestDate"
                type="date"
                value={formRequestDate}
                onChange={(e) => setFormRequestDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Ca làm</Label>
              <Select value={formPeriod} onValueChange={(value) => setFormPeriod(value as OnsitePeriod)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ca làm..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_DAY">Cả ngày</SelectItem>
                  <SelectItem value="MORNING">Buổi sáng</SelectItem>
                  <SelectItem value="AFTERNOON">Buổi chiều</SelectItem>
                  <SelectItem value="HOURS">Theo giờ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formPeriod === 'HOURS' && (
              <div className="space-y-2">
                <Label htmlFor="hours">Số giờ</Label>
                <Input
                  id="hours"
                  type="number"
                  placeholder="Nhập số giờ..."
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do</Label>
              <Input
                id="reason"
                placeholder="Nhập lý do..."
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
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
              Bạn có chắc chắn muốn xóa yêu cầu onsite này? Hành động này không thể hoàn tác.
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
