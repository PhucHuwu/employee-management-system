'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FileText } from 'lucide-react'
import type { ReviewIntern } from '@/lib/types'
import apiClient from '@/lib/api/client'

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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    REVIEWED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }

  const labels: Record<string, string> = {
    DRAFT: 'Bản nháp',
    REVIEWED: 'Đã review',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}
    >
      {labels[status] || status}
    </span>
  )
}

export default function ReviewInternReportsPage() {
  const [items, setItems] = useState<ReviewIntern[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [month, setMonth] = useState<string>('')
  const [year, setYear] = useState<string>('')

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.get<ReviewIntern[]>('/review-interns/reports', {
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
      })
      setItems(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách báo cáo review intern')
    } finally {
      setIsLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  const currentYear = new Date().getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Intern Reports</h1>
          <p className="text-muted-foreground">Xem báo cáo đánh giá intern theo tháng</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <label htmlFor="month" className="text-sm font-medium">
                Tháng
              </label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id="month" className="w-[180px]">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="year" className="text-sm font-medium">
                Năm
              </label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year" className="w-[180px]">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => void fetchItems()}>Tìm kiếm</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách báo cáo review intern</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có báo cáo</EmptyTitle>
                <EmptyDescription>Không tìm thấy báo cáo review intern nào.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intern</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Tháng</TableHead>
                  <TableHead>Năm</TableHead>
                  <TableHead>Tổng điểm</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.intern?.fullName || item.internId}
                    </TableCell>
                    <TableCell>{item.reviewer?.fullName || item.reviewerId}</TableCell>
                    <TableCell>{item.month}</TableCell>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{item.totalScore ?? '-'}</TableCell>
                    <TableCell>{item.level ?? '-'}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
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
