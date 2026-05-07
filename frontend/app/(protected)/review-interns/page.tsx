'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, UserCheck, Send, Mail, Database, CheckCircle, XCircle } from 'lucide-react'
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
import type { ReviewIntern } from '@/lib/types'
import { reviewInternApi } from '@/lib/api/endpoints'

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

export default function ReviewInternsPage() {
  const [items, setItems] = useState<ReviewIntern[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ReviewIntern | null>(null)
  const [formMonth, setFormMonth] = useState('')
  const [formYear, setFormYear] = useState('')
  const [formInternId, setFormInternId] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ReviewIntern | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await reviewInternApi.getAll({ size: 100 })
      setItems(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách review intern')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormMonth('')
    setFormYear('')
    setFormInternId('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: ReviewIntern) => {
    setEditingItem(item)
    setFormMonth(String(item.month))
    setFormYear(String(item.year))
    setFormInternId(item.internId)
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formMonth.trim() || !formYear.trim() || !formInternId.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }
    try {
      const payload = {
        month: Number(formMonth),
        year: Number(formYear),
        internId: formInternId.trim(),
      }
      if (editingItem) {
        await reviewInternApi.update(editingItem.id, payload)
        toast.success('Cập nhật review thành công')
      } else {
        await reviewInternApi.create(payload)
        toast.success('Thêm review thành công')
      }
      setIsFormOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (item: ReviewIntern) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await reviewInternApi.delete(selectedItem.id)
      toast.success('Đã xóa review')
      setDeleteDialogOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa review')
    }
  }

  const handleSubmitReview = async (item: ReviewIntern) => {
    try {
      await reviewInternApi.submitReview(item.id)
      toast.success('Đã gửi review')
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi review')
    }
  }

  const handleApprove = async (item: ReviewIntern) => {
    try {
      await reviewInternApi.approve(item.id)
      toast.success('Đã duyệt review')
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể duyệt review')
    }
  }

  const handleReject = async (item: ReviewIntern) => {
    try {
      await reviewInternApi.reject(item.id)
      toast.success('Đã từ chối review')
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể từ chối review')
    }
  }

  const handleSendMail = async (item: ReviewIntern) => {
    try {
      await reviewInternApi.sendMail(item.id)
      toast.success('Đã gửi email thông báo')
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi email')
    }
  }

  const handleUpdateToHrm = async (item: ReviewIntern) => {
    try {
      await reviewInternApi.updateToHrm(item.id)
      toast.success('Đã cập nhật lên HRM')
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật HRM')
    }
  }

  const statusLabel: Record<string, string> = {
    DRAFT: 'Bản nháp',
    REVIEWED: 'Đã review',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Intern</h1>
          <p className="text-muted-foreground">Quản lý đánh giá intern theo tháng</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm review
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách review intern</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UserCheck className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có review</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có review intern nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm review đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intern</TableHead>
                  <TableHead>Tháng/Năm</TableHead>
                  <TableHead>Tổng điểm</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.intern?.fullName || item.internId}</TableCell>
                    <TableCell>{item.month}/{item.year}</TableCell>
                    <TableCell>{item.totalScore ?? '-'}</TableCell>
                    <TableCell>{item.level ?? '-'}</TableCell>
                    <TableCell>{statusLabel[item.status] || item.status}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.status === 'DRAFT' && (
                          <Button variant="ghost" size="icon" onClick={() => handleSubmitReview(item)} title="Gửi review">
                            <Send className="size-4" />
                            <span className="sr-only">Gửi review</span>
                          </Button>
                        )}
                        {item.status === 'REVIEWED' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleApprove(item)} title="Duyệt">
                              <CheckCircle className="size-4 text-green-600" />
                              <span className="sr-only">Duyệt</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleReject(item)} title="Từ chối">
                              <XCircle className="size-4 text-red-600" />
                              <span className="sr-only">Từ chối</span>
                            </Button>
                          </>
                        )}
                        {item.status === 'APPROVED' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleSendMail(item)} title="Gửi email">
                              <Mail className="size-4" />
                              <span className="sr-only">Gửi email</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleUpdateToHrm(item)} title="Cập nhật HRM">
                              <Database className="size-4" />
                              <span className="sr-only">Cập nhật HRM</span>
                            </Button>
                          </>
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
            <DialogTitle>{editingItem ? 'Chỉnh sửa review' : 'Thêm review mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="internId">Intern ID</Label>
              <Input
                id="internId"
                placeholder="Nhập intern ID..."
                value={formInternId}
                onChange={(e) => setFormInternId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">Tháng</Label>
              <Input
                id="month"
                type="number"
                placeholder="Nhập tháng..."
                value={formMonth}
                onChange={(e) => setFormMonth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Năm</Label>
              <Input
                id="year"
                type="number"
                placeholder="Nhập năm..."
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
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
              Bạn có chắc chắn muốn xóa review này? Hành động này không thể hoàn tác.
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
