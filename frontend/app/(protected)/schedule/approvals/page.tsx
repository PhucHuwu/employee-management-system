'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, X, Search, Filter, CalendarClock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { scheduleApi } from '@/lib/api/endpoints'
import type { ScheduleRequest, ScheduleRequestType, ScheduleRequestStatus } from '@/lib/types'

const typeLabels: Record<ScheduleRequestType, string> = {
  OFF_FULL_DAY: 'Nghỉ cả ngày',
  OFF_AM: 'Nghỉ sáng',
  OFF_PM: 'Nghỉ chiều',
  REMOTE_FULL_DAY: 'Remote cả ngày',
  REMOTE_AM: 'Remote sáng',
  REMOTE_PM: 'Remote chiều',
  CHANGE_FIXED_SCHEDULE: 'Đổi ca cố định',
}

const statusLabels: Record<ScheduleRequestStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}

const getEmployeeName = (request: ScheduleRequest): string => request.employee?.fullName || 'Không rõ'

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<ScheduleRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ScheduleRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await scheduleApi.getRequests({
        status: 'PENDING',
        type: typeFilter === 'all' ? undefined : typeFilter,
        size: 100,
      })
      setRequests(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách yêu cầu')
    } finally {
      setIsLoading(false)
    }
  }, [typeFilter])

  useEffect(() => {
    void fetchRequests()
  }, [fetchRequests])

  const filteredRequests = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    if (!keyword) return requests
    return requests.filter((req) => getEmployeeName(req).toLowerCase().includes(keyword))
  }, [requests, searchKeyword])

  const handleApprove = async (request: ScheduleRequest) => {
    setIsSubmitting(true)
    try {
      await scheduleApi.approve(request.id)
      setRequests((prev) => prev.filter((r) => r.id !== request.id))
      toast.success(`Đã duyệt yêu cầu của ${getEmployeeName(request)}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenReject = (request: ScheduleRequest) => {
    setSelectedRequest(request)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }

    setIsSubmitting(true)
    try {
      await scheduleApi.reject(selectedRequest.id, rejectionReason.trim())
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
      toast.success(`Đã từ chối yêu cầu của ${getEmployeeName(selectedRequest)}`)
      setRejectDialogOpen(false)
      setSelectedRequest(null)
      setRejectionReason('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingCount = requests.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Duyệt yêu cầu</h1>
          <p className="text-muted-foreground">Xử lý các yêu cầu nghỉ phép và làm việc từ xa</p>
        </div>
        <Badge variant="secondary" className="w-fit text-base">
          {pendingCount} yêu cầu chờ duyệt
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
          <CardDescription>Các yêu cầu đang chờ duyệt từ nhân viên</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên nhân viên..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-52">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="Loại yêu cầu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="OFF_FULL_DAY">Nghỉ cả ngày</SelectItem>
                <SelectItem value="OFF_AM">Nghỉ sáng</SelectItem>
                <SelectItem value="OFF_PM">Nghỉ chiều</SelectItem>
                <SelectItem value="REMOTE_FULL_DAY">Remote cả ngày</SelectItem>
                <SelectItem value="REMOTE_AM">Remote sáng</SelectItem>
                <SelectItem value="REMOTE_PM">Remote chiều</SelectItem>
                <SelectItem value="CHANGE_FIXED_SCHEDULE">Đổi ca cố định</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : filteredRequests.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarClock className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Không có yêu cầu</EmptyTitle>
                <EmptyDescription>
                  {searchKeyword || typeFilter !== 'all'
                    ? 'Không tìm thấy yêu cầu phù hợp với bộ lọc'
                    : 'Không có yêu cầu nào đang chờ duyệt'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Loại yêu cầu</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{getEmployeeName(request)}</TableCell>
                    <TableCell>
                      <Badge variant={request.requestType.startsWith('OFF') ? 'destructive' : 'secondary'}>
                        {typeLabels[request.requestType]}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(request.requestDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason || '-'}</TableCell>
                    <TableCell>{statusLabels[request.status]}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => handleApprove(request)}
                          disabled={isSubmitting}
                        >
                          <Check className="mr-1 size-4" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleOpenReject(request)}
                          disabled={isSubmitting}
                        >
                          <X className="mr-1 size-4" />
                          Từ chối
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

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu</DialogTitle>
            <DialogDescription>
              Bạn đang từ chối yêu cầu của <strong>{selectedRequest ? getEmployeeName(selectedRequest) : ''}</strong>.
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
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting || !rejectionReason.trim()}>
              {isSubmitting && <Spinner className="mr-2 size-4" />}
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
