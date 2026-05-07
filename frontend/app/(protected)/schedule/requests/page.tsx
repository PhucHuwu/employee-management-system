'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarClock, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ListPagination } from '@/components/ui/list-pagination'
import type { ScheduleRequest, ScheduleRequestType, ScheduleRequestStatus } from '@/lib/types'
import { scheduleApi } from '@/lib/api/endpoints'
import { useAuth } from '@/lib/auth-context'

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

const statusVariants: Record<ScheduleRequestStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  )
}

export default function MyScheduleRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ScheduleRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchRequests = useCallback(async () => {
    if (!user?.employeeId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const res = await scheduleApi.getRequests({
        employeeId: user.employeeId,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
        from: fromDate || undefined,
        to: toDate || undefined,
        page,
        size,
      })
      setRequests(res.items)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách yêu cầu')
    } finally {
      setIsLoading(false)
    }
  }, [user?.employeeId, statusFilter, typeFilter, fromDate, toDate, page, size])

  useEffect(() => {
    void fetchRequests()
  }, [fetchRequests])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, typeFilter, fromDate, toDate])

  const rows = useMemo(() => requests, [requests])

  const handleClearFilters = () => {
    setStatusFilter('all')
    setTypeFilter('all')
    setFromDate('')
    setToDate('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Yêu cầu lịch làm việc của tôi</h1>
        <p className="text-muted-foreground">Xem lịch sử các yêu cầu nghỉ phép, remote và đổi ca của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarClock className="size-5" />Bộ lọc</CardTitle>
          <CardDescription>Lọc theo trạng thái, loại yêu cầu và thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Loại yêu cầu" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2"><CalendarClock className="size-4 text-muted-foreground" /><Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="Từ ngày" /></div>
            <div className="flex items-center gap-2"><CalendarClock className="size-4 text-muted-foreground" /><Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="Đến ngày" /></div>
            <Button variant="outline" onClick={handleClearFilters}>Xóa bộ lọc</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Danh sách yêu cầu</CardTitle>
            <Badge variant="outline" className="text-sm">{rows.length} yêu cầu</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><CalendarClock className="size-5" /></EmptyMedia>
                <EmptyTitle>Không có yêu cầu</EmptyTitle>
                <EmptyDescription>Bạn chưa có yêu cầu lịch làm việc nào phù hợp với bộ lọc</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại</TableHead>
                    <TableHead>Ngày yêu cầu</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Người duyệt</TableHead>
                    <TableHead>Lý do từ chối</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{typeLabels[req.requestType]}</TableCell>
                      <TableCell>{new Date(req.requestDate).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="max-w-xs"><p className="line-clamp-1">{req.reason || '-'}</p></TableCell>
                      <TableCell><Badge variant={statusVariants[req.status]}>{statusLabels[req.status]}</Badge></TableCell>
                      <TableCell>{req.approvedBy || '-'}</TableCell>
                      <TableCell className="max-w-xs"><p className="line-clamp-1 text-destructive">{req.rejectionReason || '-'}</p></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ListPagination page={page} totalPages={totalPages} total={total} size={size} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
