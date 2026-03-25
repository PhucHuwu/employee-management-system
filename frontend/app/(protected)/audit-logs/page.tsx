'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, ScrollText, Filter, ShieldAlert } from 'lucide-react'
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ListPagination } from '@/components/ui/list-pagination'
import { useAuth } from '@/lib/auth-context'
import { auditLogApi } from '@/lib/api/endpoints'
import type { AuditLog } from '@/lib/types'

const actionLabels: Record<string, string> = {
  EMPLOYEE_CREATED: 'Tạo nhân viên',
  EMPLOYEE_UPDATED: 'Cập nhật nhân viên',
  EMPLOYEE_SOFT_DELETED: 'Ngừng sử dụng nhân viên',
  EMPLOYEE_PROMOTED: 'Thăng chức nhân viên',
  POSITION_UPDATED: 'Cập nhật vị trí',
  POSITION_DELETED: 'Xóa vị trí',
  EMPLOYEE_POSITION_UPDATED: 'Cập nhật vị trí nhân viên',
  EMPLOYEE_POSITION_BULK_UPDATED: 'Cập nhật vị trí hàng loạt',
  PROJECT_UPDATED: 'Cập nhật dự án',
  PROJECT_DELETED: 'Xóa dự án',
  PROJECT_REVENUE_CREATED: 'Thêm doanh thu dự án',
  SCHEDULE_REQUEST_APPROVED: 'Duyệt yêu cầu lịch',
  SCHEDULE_REQUEST_REJECTED: 'Từ chối yêu cầu lịch',
}

const actionVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  EMPLOYEE_CREATED: 'default',
  EMPLOYEE_UPDATED: 'secondary',
  EMPLOYEE_SOFT_DELETED: 'destructive',
  EMPLOYEE_PROMOTED: 'default',
  POSITION_UPDATED: 'secondary',
  POSITION_DELETED: 'destructive',
  EMPLOYEE_POSITION_UPDATED: 'secondary',
  EMPLOYEE_POSITION_BULK_UPDATED: 'secondary',
  PROJECT_UPDATED: 'secondary',
  PROJECT_DELETED: 'destructive',
  PROJECT_REVENUE_CREATED: 'default',
  SCHEDULE_REQUEST_APPROVED: 'default',
  SCHEDULE_REQUEST_REJECTED: 'destructive',
}

const actionOptions = [
  { value: 'all', label: 'Tất cả hành động' },
  { value: 'EMPLOYEE_CREATED', label: 'Tạo nhân viên' },
  { value: 'EMPLOYEE_UPDATED', label: 'Cập nhật nhân viên' },
  { value: 'EMPLOYEE_SOFT_DELETED', label: 'Ngừng sử dụng nhân viên' },
  { value: 'EMPLOYEE_PROMOTED', label: 'Thăng chức nhân viên' },
  { value: 'PROJECT_UPDATED', label: 'Cập nhật dự án' },
  { value: 'PROJECT_DELETED', label: 'Xóa dự án' },
  { value: 'PROJECT_REVENUE_CREATED', label: 'Thêm doanh thu dự án' },
  { value: 'SCHEDULE_REQUEST_APPROVED', label: 'Duyệt yêu cầu lịch' },
  { value: 'SCHEDULE_REQUEST_REJECTED', label: 'Từ chối yêu cầu lịch' },
  { value: 'POSITION_UPDATED', label: 'Cập nhật vị trí' },
  { value: 'POSITION_DELETED', label: 'Xóa vị trí' },
  { value: 'EMPLOYEE_POSITION_UPDATED', label: 'Cập nhật vị trí nhân viên' },
  { value: 'EMPLOYEE_POSITION_BULK_UPDATED', label: 'Cập nhật vị trí hàng loạt' },
]

const entityTypeOptions = [
  { value: 'all', label: 'Tất cả đối tượng' },
  { value: 'EMPLOYEE', label: 'Nhân viên' },
  { value: 'POSITION', label: 'Vị trí' },
  { value: 'JOB_TITLE', label: 'Chức danh' },
  { value: 'PROJECT', label: 'Dự án' },
  { value: 'SCHEDULE_REQUEST', label: 'Yêu cầu lịch' },
  { value: 'PROJECT_REVENUE', label: 'Doanh thu dự án' },
]

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  )
}

export default function AuditLogsPage() {
  const { hasRole } = useAuth()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const isAdmin = hasRole('Admin')

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await auditLogApi.getAll({
        action: actionFilter === 'all' ? undefined : actionFilter,
        entityType: entityTypeFilter === 'all' ? undefined : entityTypeFilter,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        page,
        size,
      })
      setAuditLogs(data.items)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được audit logs')
    } finally {
      setIsLoading(false)
    }
  }, [actionFilter, entityTypeFilter, dateFrom, dateTo, page, size])

  useEffect(() => {
    if (isAdmin) {
      void fetchLogs()
    }
  }, [fetchLogs, isAdmin])

  const filteredLogs = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    if (!keyword) return auditLogs
    return auditLogs.filter((log) => {
      const actor = `${log.actorRole || ''} ${log.actorId || ''}`.toLowerCase()
      return actor.includes(keyword) || log.action.toLowerCase().includes(keyword) || log.entityType.toLowerCase().includes(keyword)
    })
  }, [auditLogs, searchKeyword])

  const handleClearFilters = () => {
    setSearchKeyword('')
    setActionFilter('all')
    setEntityTypeFilter('all')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  useEffect(() => {
    setPage(1)
  }, [actionFilter, entityTypeFilter, dateFrom, dateTo])

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><ShieldAlert className="size-5" /></EmptyMedia>
            <EmptyTitle>Không có quyền truy cập</EmptyTitle>
            <EmptyDescription>Chỉ Admin mới có thể xem trang Audit Logs.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Lịch sử các hoạt động trong hệ thống</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="size-5" />Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Tìm theo action/entity/actor..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="pl-9" />
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger><SelectValue placeholder="Hành động" /></SelectTrigger>
              <SelectContent>
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Đối tượng" /></SelectTrigger>
              <SelectContent>
                {entityTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="Từ ngày" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="Đến ngày" />
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleClearFilters}>Xóa bộ lọc</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ScrollText className="size-5" />Danh sách logs</CardTitle>
          <CardDescription>{filteredLogs.length} bản ghi được tìm thấy</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : filteredLogs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><ScrollText className="size-5" /></EmptyMedia>
                <EmptyTitle>Không có log</EmptyTitle>
                <EmptyDescription>Không tìm thấy log nào phù hợp với bộ lọc</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Hành động</TableHead>
                    <TableHead>Đối tượng</TableHead>
                    <TableHead>ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">{new Date(log.createdAt).toLocaleString('vi-VN')}</TableCell>
                      <TableCell className="font-medium">{log.actorRole ? `${log.actorRole} (${log.actorId || '-'})` : (log.actorId || '-')}</TableCell>
                      <TableCell><Badge variant={actionVariants[log.action] || 'outline'}>{actionLabels[log.action] || log.action}</Badge></TableCell>
                      <TableCell>{log.entityType}</TableCell>
                      <TableCell className="font-mono text-sm">{log.entityId}</TableCell>
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
