'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { Invoice, InvoiceStatus } from '@/lib/types'
import { invoiceApi } from '@/lib/api/endpoints'

interface AgingBucket {
  count: number
  amount: number
  invoices: Invoice[]
}

interface AccountsReceivableData {
  aging: Record<string, AgingBucket>
  totalOutstanding: number
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

const statusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'Bản nháp',
  SENT: 'Đã gửi',
  PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn',
}

const statusBadgeVariant: Record<InvoiceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  SENT: 'default',
  PAID: 'outline',
  OVERDUE: 'destructive',
}

const bucketLabels: Record<string, string> = {
  '0-30': '0-30 ngày',
  '31-60': '31-60 ngày',
  '61-90': '61-90 ngày',
  '>90': '>90 ngày',
}

const bucketOrder = ['0-30', '31-60', '61-90', '>90']

export default function AccountsReceivablePage() {
  const [data, setData] = useState<AccountsReceivableData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await invoiceApi.getAccountsReceivable()
      setData(result)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được báo cáo công nợ')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const outstandingInvoices = useMemo(() => {
    if (!data) return []
    const all: Invoice[] = []
    bucketOrder.forEach((key) => {
      const bucket = data.aging[key]
      if (bucket && bucket.invoices) {
        all.push(...bucket.invoices)
      }
    })
    return all.filter((inv) => inv.status === 'SENT' || inv.status === 'OVERDUE')
  }, [data])

  const totalOutstanding = data?.totalOutstanding ?? 0

  const today = useMemo(() => new Date(), [])

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const diff = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Công nợ phải thu</h1>
        <p className="text-muted-foreground">Báo cáo phân tích tuổi nợ và hóa đơn chưa thanh toán</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tổng công nợ phải thu</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <div className="text-3xl font-bold">
              {totalOutstanding.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Báo cáo phân tích tuổi nợ</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : !data ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có dữ liệu</EmptyTitle>
                <EmptyDescription>Không thể tải báo cáo công nợ.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khoảng ngày</TableHead>
                  <TableHead className="text-right">Số lượng hóa đơn</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bucketOrder.map((key) => {
                  const bucket = data.aging[key]
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{bucketLabels[key]}</TableCell>
                      <TableCell className="text-right">{bucket?.count ?? 0}</TableCell>
                      <TableCell className="text-right">
                        {(bucket?.amount ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết hóa đơn chưa thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : outstandingInvoices.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Không có hóa đơn chưa thanh toán</EmptyTitle>
                <EmptyDescription>Tất cả hóa đơn đã được thanh toán hoặc chưa phát sinh.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã hóa đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead>Ngày đến hạn</TableHead>
                  <TableHead className="text-right">Số ngày quá hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.id.slice(0, 8)}</TableCell>
                    <TableCell>{inv.customer?.companyName ?? inv.customerId}</TableCell>
                    <TableCell className="text-right">
                      {inv.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </TableCell>
                    <TableCell>{new Date(inv.dueDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-right">{getDaysOverdue(inv.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[inv.status]}>
                        {statusLabels[inv.status]}
                      </Badge>
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
