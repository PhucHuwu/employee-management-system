'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Receipt, Search, Filter } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import type { ExpenseClaim, ExpenseClaimStatus } from '@/lib/types'
import { expenseClaimApi } from '@/lib/api/endpoints'
import { useAuth } from '@/lib/auth-context'

const statusLabels: Record<ExpenseClaimStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
}

function getStatusBadge(status: ExpenseClaimStatus) {
  switch (status) {
    case 'PENDING':
      return <Badge className="bg-amber-500 text-white hover:bg-amber-500/90">{statusLabels.PENDING}</Badge>
    case 'APPROVED':
      return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">{statusLabels.APPROVED}</Badge>
    case 'REJECTED':
      return <Badge variant="destructive">{statusLabels.REJECTED}</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="ml-auto h-8 w-24" />
        </div>
      ))}
    </div>
  )
}

interface FormState {
  employeeId: string
  projectId: string
  amount: string
  category: string
  description: string
  receiptUrl: string
}

const emptyForm: FormState = {
  employeeId: '',
  projectId: '',
  amount: '',
  category: '',
  description: '',
  receiptUrl: '',
}

export default function ExpenseClaimsPage() {
  const { hasAnyRole } = useAuth()
  const isManagerOrAdmin = hasAnyRole(['Admin', 'Manager'])

  const [claims, setClaims] = useState<ExpenseClaim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClaim, setEditingClaim] = useState<ExpenseClaim | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null)

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingClaim, setRejectingClaim] = useState<ExpenseClaim | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchClaims = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await expenseClaimApi.getAll({
        status: statusFilter === 'all' ? undefined : statusFilter,
        size: 100,
      })
      setClaims(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách yêu cầu hoàn trả')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    void fetchClaims()
  }, [fetchClaims])

  const filteredClaims = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    if (!keyword) return claims
    return claims.filter(
      (claim) =>
        (claim.employee?.fullName ?? '').toLowerCase().includes(keyword) ||
        (claim.project?.name ?? '').toLowerCase().includes(keyword) ||
        claim.category.toLowerCase().includes(keyword)
    )
  }, [claims, searchKeyword])

  const handleOpenCreate = () => {
    setEditingClaim(null)
    setForm(emptyForm)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (claim: ExpenseClaim) => {
    setEditingClaim(claim)
    setForm({
      employeeId: claim.employeeId,
      projectId: claim.projectId,
      amount: String(claim.amount),
      category: claim.category,
      description: claim.description ?? '',
      receiptUrl: claim.receiptUrl ?? '',
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.employeeId.trim()) {
      toast.error('Vui lòng nhập mã nhân viên')
      return
    }
    if (!form.projectId.trim()) {
      toast.error('Vui lòng nhập mã dự án')
      return
    }
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Số tiền không hợp lệ')
      return
    }
    if (!form.category.trim()) {
      toast.error('Vui lòng nhập danh mục')
      return
    }

    const payload: Partial<ExpenseClaim> = {
      employeeId: form.employeeId.trim(),
      projectId: form.projectId.trim(),
      amount,
      category: form.category.trim(),
      description: form.description.trim() || undefined,
      receiptUrl: form.receiptUrl.trim() || undefined,
    }

    try {
      if (editingClaim) {
        await expenseClaimApi.update(editingClaim.id, payload)
        toast.success('Cập nhật yêu cầu hoàn trả thành công')
      } else {
        await expenseClaimApi.create(payload)
        toast.success('Thêm yêu cầu hoàn trả thành công')
      }
      setIsFormOpen(false)
      await fetchClaims()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (claim: ExpenseClaim) => {
    setSelectedClaim(claim)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedClaim) return
    try {
      await expenseClaimApi.delete(selectedClaim.id)
      toast.success('Đã xóa yêu cầu hoàn trả')
      setDeleteDialogOpen(false)
      await fetchClaims()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa yêu cầu hoàn trả')
    }
  }

  const handleApprove = async (claim: ExpenseClaim) => {
    setIsSubmitting(true)
    try {
      await expenseClaimApi.approve(claim.id)
      toast.success('Đã duyệt yêu cầu hoàn trả')
      await fetchClaims()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Duyệt thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenReject = (claim: ExpenseClaim) => {
    setRejectingClaim(claim)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  const handleReject = async () => {
    if (!rejectingClaim || !rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }
    setIsSubmitting(true)
    try {
      await expenseClaimApi.reject(rejectingClaim.id, rejectionReason.trim())
      toast.success('Đã từ chối yêu cầu hoàn trả')
      setRejectDialogOpen(false)
      setRejectingClaim(null)
      setRejectionReason('')
      await fetchClaims()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Từ chối thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateForm = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Yêu cầu hoàn trả chi phí</h1>
          <p className="text-muted-foreground">Quản lý các yêu cầu hoàn trả chi phí trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm yêu cầu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu hoàn trả</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo nhân viên, dự án, danh mục..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-52">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : filteredClaims.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Receipt className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có yêu cầu hoàn trả</EmptyTitle>
                <EmptyDescription>
                  {searchKeyword || statusFilter !== 'all'
                    ? 'Không tìm thấy yêu cầu phù hợp với bộ lọc'
                    : 'Hệ thống chưa có yêu cầu hoàn trả nào.'}
                </EmptyDescription>
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
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Dự án</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">
                      {claim.employee?.fullName ?? claim.employeeId}
                    </TableCell>
                    <TableCell>{claim.project?.name ?? claim.projectId}</TableCell>
                    <TableCell>{formatCurrency(claim.amount)}</TableCell>
                    <TableCell>{claim.category}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell>{new Date(claim.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {claim.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(claim)}
                            >
                              <Pencil className="size-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDelete(claim)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                              <span className="sr-only">Xóa</span>
                            </Button>
                          </>
                        )}
                        {isManagerOrAdmin && claim.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => handleApprove(claim)}
                              disabled={isSubmitting}
                            >
                              <Check className="mr-1 size-4" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleOpenReject(claim)}
                              disabled={isSubmitting}
                            >
                              <X className="mr-1 size-4" />
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClaim ? 'Chỉnh sửa yêu cầu hoàn trả' : 'Thêm yêu cầu hoàn trả mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="claim-employee">Mã nhân viên</Label>
              <Input
                id="claim-employee"
                placeholder="Nhập mã nhân viên..."
                value={form.employeeId}
                onChange={(e) => updateForm('employeeId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim-project">Mã dự án</Label>
              <Input
                id="claim-project"
                placeholder="Nhập mã dự án..."
                value={form.projectId}
                onChange={(e) => updateForm('projectId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim-amount">Số tiền</Label>
              <Input
                id="claim-amount"
                type="number"
                placeholder="Nhập số tiền..."
                value={form.amount}
                onChange={(e) => updateForm('amount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim-category">Danh mục</Label>
              <Input
                id="claim-category"
                placeholder="Nhập danh mục..."
                value={form.category}
                onChange={(e) => updateForm('category', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim-description">Mô tả</Label>
              <Textarea
                id="claim-description"
                placeholder="Nhập mô tả..."
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim-receipt">URL hóa đơn</Label>
              <Input
                id="claim-receipt"
                placeholder="Nhập URL hóa đơn..."
                value={form.receiptUrl}
                onChange={(e) => updateForm('receiptUrl', e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa yêu cầu hoàn trả của{' '}
              <strong>{selectedClaim?.employee?.fullName ?? selectedClaim?.employeeId}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu hoàn trả</DialogTitle>
            <DialogDescription>
              Bạn đang từ chối yêu cầu của{' '}
              <strong>{rejectingClaim ? (rejectingClaim.employee?.fullName ?? rejectingClaim.employeeId) : ''}</strong>.
              Vui lòng nhập lý do từ chối.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Nhập lý do từ chối (bắt buộc)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting && <Spinner className="mr-2 size-4" />}
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
