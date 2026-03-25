'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { scheduleApi } from '@/lib/api/endpoints'
import type { DailyDrilldown, DailySummary, ScheduleRequestType } from '@/lib/types'

const typeLabels: Record<ScheduleRequestType, string> = {
  OFF_FULL_DAY: 'Nghỉ cả ngày',
  OFF_AM: 'Nghỉ sáng',
  OFF_PM: 'Nghỉ chiều',
  REMOTE_FULL_DAY: 'Remote cả ngày',
  REMOTE_AM: 'Remote sáng',
  REMOTE_PM: 'Remote chiều',
  CHANGE_FIXED_SCHEDULE: 'Đổi ca cố định',
}

function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {[...Array(35)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  )
}

const getCount = (data: DailySummary, type: ScheduleRequestType): number => {
  if (data.counts && typeof data.counts[type] === 'number') {
    return data.counts[type]
  }

  if (type === 'OFF_FULL_DAY') return data.offFullDay
  if (type === 'OFF_AM') return data.offAM
  if (type === 'OFF_PM') return data.offPM
  if (type === 'REMOTE_FULL_DAY') return data.remoteFullDay
  if (type === 'REMOTE_AM') return data.remoteAM
  if (type === 'REMOTE_PM') return data.remotePM
  return 0
}

export default function ScheduleCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [summaryData, setSummaryData] = useState<DailySummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<ScheduleRequestType | null>(null)
  const [drilldownData, setDrilldownData] = useState<DailyDrilldown[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`

  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await scheduleApi.getDailySummary({ from, to })
      setSummaryData(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được dữ liệu lịch')
    } finally {
      setIsLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void fetchSummary()
  }, [fetchSummary])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleChipClick = async (date: string, type: ScheduleRequestType) => {
    setSelectedDate(date)
    setSelectedType(type)
    setIsSheetOpen(true)
    try {
      const data = await scheduleApi.getDailyDrilldown({ date, type })
      setDrilldownData(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được chi tiết nhân viên')
      setDrilldownData([])
    }
  }

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const result: Array<number | null> = []
    for (let i = 0; i < firstDay; i += 1) result.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) result.push(day)
    return result
  }, [year, month])

  const getDataForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return summaryData.find((d) => d.date === dateStr)
  }

  const renderDayCell = (day: number | null, index: number) => {
    if (day === null) {
      return <div key={index} className="h-28" />
    }

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const data = getDataForDay(day)
    const dayOfWeek = new Date(year, month, day).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

    return (
      <div key={index} className={`h-28 rounded-lg border p-2 ${isWeekend ? 'bg-muted/50' : 'bg-card'} ${isToday ? 'ring-2 ring-primary' : ''}`}>
        <div className={`text-sm font-medium ${isWeekend ? 'text-muted-foreground' : ''}`}>{day}</div>
        {!isWeekend && data && (
          <div className="mt-1 flex flex-wrap gap-1">
            {getCount(data, 'OFF_FULL_DAY') > 0 && (
              <Badge variant="destructive" className="cursor-pointer text-xs" onClick={() => handleChipClick(dateStr, 'OFF_FULL_DAY')}>
                Nghỉ: {getCount(data, 'OFF_FULL_DAY')}
              </Badge>
            )}
            {getCount(data, 'REMOTE_FULL_DAY') > 0 && (
              <Badge variant="secondary" className="cursor-pointer text-xs" onClick={() => handleChipClick(dateStr, 'REMOTE_FULL_DAY')}>
                Remote: {getCount(data, 'REMOTE_FULL_DAY')}
              </Badge>
            )}
            {(getCount(data, 'OFF_AM') + getCount(data, 'OFF_PM')) > 0 && (
              <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => handleChipClick(dateStr, getCount(data, 'OFF_AM') > 0 ? 'OFF_AM' : 'OFF_PM')}>
                Nghỉ nửa: {getCount(data, 'OFF_AM') + getCount(data, 'OFF_PM')}
              </Badge>
            )}
          </div>
        )}
      </div>
    )
  }

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lịch làm việc</h1>
        <p className="text-muted-foreground">Tổng quan lịch nghỉ và làm việc từ xa của nhân viên</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="size-5" />
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}><ChevronLeft className="size-4" /></Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Hôm nay</Button>
              <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}><ChevronRight className="size-4" /></Button>
            </div>
          </div>
          <CardDescription>Click vào badge để xem chi tiết nhân viên</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CalendarSkeleton />
          ) : (
            <>
              <div className="mb-2 grid grid-cols-7 gap-2">
                {dayNames.map((day) => (
                  <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">{days.map((day, index) => renderDayCell(day, index))}</div>
            </>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Users className="size-5" />Chi tiết nhân viên</SheetTitle>
            <SheetDescription>
              {selectedDate && selectedType ? `${new Date(selectedDate).toLocaleDateString('vi-VN')} - ${typeLabels[selectedType]}` : ''}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {drilldownData.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Nhân viên</TableHead><TableHead>Mã phòng ban</TableHead></TableRow></TableHeader>
                <TableBody>
                  {drilldownData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.employee.fullName}</TableCell>
                      <TableCell>{item.employee.departmentId || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon"><Users className="size-5" /></EmptyMedia>
                  <EmptyTitle>Không có dữ liệu</EmptyTitle>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
