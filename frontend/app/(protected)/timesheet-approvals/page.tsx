'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, XCircle, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
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

export default function TimesheetApprovalsPage() {
  const [items, setItems] = useState<TimesheetEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await timesheetEntryApi.getAll({ status: 'PENDING', size: 100 })
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

  const handleApprove = async (item: TimesheetEntry) => {
    try {
      await timesheetEntryApi.approve(item.id)
      toast.success('Đã duyệt timesheet')
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể duyệt timesheet')
    }
  }

  const handleReject = async (item: TimesheetEntry) => {
    try {
      await timesheetEntryApi.reject(item.id)
      toast.success('Đã từ chối timesheet')
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể từ chối timesheet')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Duyệt Timesheet</h1>
          <p className="text-muted-foreground">Phê duyệt timesheet của nhân viên</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chờ duyệt</CardTitle>
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
                <EmptyTitle>Không có timesheet chờ duyệt</EmptyTitle>
                <EmptyDescription>Tất cả timesheet đã được xử lý.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
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
                    <TableCell className="font-medium">{item.employee?.fullName || item.employeeId}</TableCell>
                    <TableCell>{new Date(item.entryDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{item.normalWorkingTime}h</TableCell>
                    <TableCell>{item.overtime}h</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell>{item.note || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleApprove(item)} title="Duyệt">
                          <CheckCircle className="size-4 text-green-600" />
                          <span className="sr-only">Duyệt</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleReject(item)} title="Từ chối">
                          <XCircle className="size-4 text-red-600" />
                          <span className="sr-only">Từ chối</span>
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
    </div>
  )
}
