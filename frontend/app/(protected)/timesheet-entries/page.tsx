'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ClipboardList, Send } from 'lucide-react'
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
import type { TimesheetEntry } from '@/lib/types'
import { timesheetEntryApi } from '@/lib/api/endpoints'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    PENDING: 'bg-yellow-500',
    APPROVED: 'bg-green-500',
    REJECTED: 'bg-red-500',
  }
  return <Badge className={map[status] || 'bg-gray-500'}>{status}</Badge>
}

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

export default function TimesheetEntriesPage() {
  const [items, setItems] = useState<TimesheetEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TimesheetEntry | null>(null)
  const [formEntryDate, setFormEntryDate] = useState('')
  const [formNormalWorkingTime, setFormNormalWorkingTime] = useState('')
  const [formOvertime, setFormOvertime] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formProjectId, setFormProjectId] = useState('')
  const [formTaskId, setFormTaskId] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<TimesheetEntry | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await timesheetEntryApi.getAll({ size: 100 })
      setItems(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách timesheet')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormEntryDate('')
    setFormNormalWorkingTime('')
    setFormOvertime('')
    setFormNote('')
    setFormProjectId('')
    setFormTaskId('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: TimesheetEntry) => {
    setEditingItem(item)
    setFormEntryDate(item.entryDate.split('T')[0])
    setFormNormalWorkingTime(String(item.normalWorkingTime))
    setFormOvertime(String(item.overtime))
    setFormNote(item.note || '')
    setFormProjectId(item.projectId)
    setFormTaskId(item.taskId)
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formEntryDate.trim()) {
      toast.error('Vui lòng chọn ngày')
      return
    }
    try {
      const payload = {
        entryDate: new Date(formEntryDate).toISOString(),
        normalWorkingTime: Number(formNormalWorkingTime) || 0,
        overtime: Number(formOvertime) || 0,
        note: formNote.trim() || undefined,
        projectId: formProjectId.trim(),
        taskId: formTaskId.trim(),
      }
      if (editingItem) {
        await timesheetEntryApi.update(editingItem.id, payload)
        toast.success('Cập nhật timesheet thành công')
      } else {
        await timesheetEntryApi.create(payload)
        toast.success('Thêm timesheet thành công')
      }
      setIsFormOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (item: TimesheetEntry) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await timesheetEntryApi.delete(selectedItem.id)
      toast.success('Đã xóa timesheet')
      setDeleteDialogOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa timesheet')
    }
  }

  const handleSubmitTimesheet = async (item: TimesheetEntry) => {
    try {
      await timesheetEntryApi.submit(item.id)
      toast.success('Đã gửi timesheet')
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi timesheet')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Log Timesheet</h1>
          <p className="text-muted-foreground">Ghi nhận thờigian làm việc</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm timesheet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách timesheet</CardTitle>
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
                <EmptyTitle>Chưa có timesheet</EmptyTitle>
                <EmptyDescription>Bạn chưa ghi nhận timesheet nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm timesheet đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Giờ làm</TableHead>
                  <TableHead>OT</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{new Date(item.entryDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{item.normalWorkingTime}h</TableCell>
                    <TableCell>{item.overtime}h</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell>{item.note || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.status === 'DRAFT' && (
                          <Button variant="ghost" size="icon" onClick={() => handleSubmitTimesheet(item)} title="Gửi">
                            <Send className="size-4" />
                            <span className="sr-only">Gửi</span>
                          </Button>
                        )}
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
            <DialogTitle>{editingItem ? 'Chỉnh sửa timesheet' : 'Thêm timesheet mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="entryDate">Ngày</Label>
              <Input
                id="entryDate"
                type="date"
                value={formEntryDate}
                onChange={(e) => setFormEntryDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="normalWorkingTime">Giờ làm việc (giờ)</Label>
              <Input
                id="normalWorkingTime"
                type="number"
                placeholder="8"
                value={formNormalWorkingTime}
                onChange={(e) => setFormNormalWorkingTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overtime">Overtime (giờ)</Label>
              <Input
                id="overtime"
                type="number"
                placeholder="0"
                value={formOvertime}
                onChange={(e) => setFormOvertime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                placeholder="Nhập project ID..."
                value={formProjectId}
                onChange={(e) => setFormProjectId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskId">Task ID</Label>
              <Input
                id="taskId"
                placeholder="Nhập task ID..."
                value={formTaskId}
                onChange={(e) => setFormTaskId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Input
                id="note"
                placeholder="Nhập ghi chú..."
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
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
              Bạn có chắc chắn muốn xóa timesheet này? Hành động này không thể hoàn tác.
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
