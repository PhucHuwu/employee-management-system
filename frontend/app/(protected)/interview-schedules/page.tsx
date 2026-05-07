'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, CalendarClock, Mail } from 'lucide-react'
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
import type { InterviewSchedule } from '@/lib/types'
import { interviewScheduleApi } from '@/lib/api/endpoints'

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

export default function InterviewSchedulesPage() {
  const [items, setItems] = useState<InterviewSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InterviewSchedule | null>(null)
  const [formCandidateId, setFormCandidateId] = useState('')
  const [formScheduledAt, setFormScheduledAt] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formMeetingLink, setFormMeetingLink] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InterviewSchedule | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await interviewScheduleApi.getAll({ size: 100 })
      setItems(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách lịch phỏng vấn')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormCandidateId('')
    setFormScheduledAt('')
    setFormLocation('')
    setFormMeetingLink('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: InterviewSchedule) => {
    setEditingItem(item)
    setFormCandidateId(item.candidateId)
    setFormScheduledAt(item.scheduledAt.slice(0, 16))
    setFormLocation(item.location || '')
    setFormMeetingLink(item.meetingLink || '')
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formCandidateId.trim()) {
      toast.error('Vui lòng nhập candidate ID')
      return
    }
    if (!formScheduledAt.trim()) {
      toast.error('Vui lòng chọn thờigian')
      return
    }
    try {
      const payload = {
        candidateId: formCandidateId.trim(),
        scheduledAt: new Date(formScheduledAt).toISOString(),
        location: formLocation.trim() || undefined,
        meetingLink: formMeetingLink.trim() || undefined,
      }
      if (editingItem) {
        await interviewScheduleApi.update(editingItem.id, payload)
        toast.success('Cập nhật lịch phỏng vấn thành công')
      } else {
        await interviewScheduleApi.create(payload)
        toast.success('Thêm lịch phỏng vấn thành công')
      }
      setIsFormOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (item: InterviewSchedule) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await interviewScheduleApi.delete(selectedItem.id)
      toast.success('Đã xóa lịch phỏng vấn')
      setDeleteDialogOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa lịch phỏng vấn')
    }
  }

  const handleSendMail = async (item: InterviewSchedule) => {
    try {
      await interviewScheduleApi.sendMail(item.id)
      toast.success('Đã gửi email thông báo')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi email')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lịch phỏng vấn</h1>
          <p className="text-muted-foreground">Quản lý lịch phỏng vấn ứng viên</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm lịch phỏng vấn
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lịch phỏng vấn</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarClock className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có lịch phỏng vấn</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có lịch phỏng vấn nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm lịch phỏng vấn đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ứng viên</TableHead>
                  <TableHead>Thờigian</TableHead>
                  <TableHead>Địa điểm/Link</TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.candidate?.fullName || item.candidateId}</TableCell>
                    <TableCell>{new Date(item.scheduledAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>{item.location || item.meetingLink || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleSendMail(item)} title="Gửi email">
                          <Mail className="size-4" />
                          <span className="sr-only">Gửi email</span>
                        </Button>
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
            <DialogTitle>{editingItem ? 'Chỉnh sửa lịch phỏng vấn' : 'Thêm lịch phỏng vấn mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="candidateId">Candidate ID</Label>
              <Input
                id="candidateId"
                placeholder="Nhập candidate ID..."
                value={formCandidateId}
                onChange={(e) => setFormCandidateId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Thờigian</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formScheduledAt}
                onChange={(e) => setFormScheduledAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Địa điểm</Label>
              <Input
                id="location"
                placeholder="Nhập địa điểm..."
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Link họp</Label>
              <Input
                id="meetingLink"
                placeholder="Nhập link họp..."
                value={formMeetingLink}
                onChange={(e) => setFormMeetingLink(e.target.value)}
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
              Bạn có chắc chắn muốn xóa lịch phỏng vấn này? Hành động này không thể hoàn tác.
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
