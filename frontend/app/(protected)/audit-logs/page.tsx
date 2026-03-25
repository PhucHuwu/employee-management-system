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
import { useAuth } from '@/lib/auth-context'
import { auditLogApi } from '@/lib/api/endpoints'
import type { AuditLog } from '@/lib/types'

const actionLabels: Record<string, string> = {
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  APPROVE: 'Duyệt',
  REJECT: 'Từ chối',
}

const actionVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CREATE: 'default',
  UPDATE: 'secondary',
  DELETE: 'destructive',
  APPROVE: 'default',
  REJECT: 'destructive',
}

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

  const isAdmin = hasRole('Admin')

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await auditLogApi.getAll({
        action: actionFilter === 'all' ? undefined : actionFilter,
        entityType: entityTypeFilter === 'all' ? undefined : entityTypeFilter,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        size: 100,
      })
      setAuditLogs(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được audit logs')
    } finally {
      setIsLoading(false)
    }
  }, [actionFilter, entityTypeFilter, dateFrom, dateTo])

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
  }

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
                <SelectItem value="all">Tất cả hành động</SelectItem>
                <SelectItem value="CREATE">Tạo mới</SelectItem>
                <SelectItem value="UPDATE">Cập nhật</SelectItem>
                <SelectItem value="DELETE">Xóa</SelectItem>
                <SelectItem value="APPROVE">Duyệt</SelectItem>
                <SelectItem value="REJECT">Từ chối</SelectItem>
              </SelectContent>
            </Select>

            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Đối tượng" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đối tượng</SelectItem>
                <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
                <SelectItem value="PROJECT">Dự án</SelectItem>
                <SelectItem value="SCHEDULE_REQUEST">Yêu cầu lịch</SelectItem>
                <SelectItem value="PROJECT_REVENUE">Doanh thu dự án</SelectItem>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
