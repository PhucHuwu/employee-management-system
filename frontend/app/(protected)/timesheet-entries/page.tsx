'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ClipboardList, Send, ChevronLeft, ChevronRight, CalendarDays, List } from 'lucide-react'
import { toast } from 'sonner'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
  isWeekend,
  parseISO,
  isSameDay,
} from 'date-fns'
import { vi } from 'date-fns/locale'
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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

function statusDot(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-400',
    PENDING: 'bg-yellow-400',
    APPROVED: 'bg-green-400',
    REJECTED: 'bg-red-400',
  }
  return <span className={`inline-block h-2 w-2 rounded-full ${map[status] || 'bg-gray-400'}`} />
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

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2024, i, 1), 'MMMM', { locale: vi }),
}))

const YEARS = Array.from({ length: 11 }, (_, i) => {
  const year = 2020 + i
  return { value: String(year), label: String(year) }
})

const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export default function TimesheetEntriesPage() {
  const [items, setItems] = useState<TimesheetEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TimesheetEntry | null>(null)
  const [formEntryDate, setFormEntryDate] = useState('')
  const [formNormalWorkingTime, setFormNormalWorkingTime] = useState('')
  const [formOvertime, setFormOvertime] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formProjectId, setFormProjectId] = useState('')
  const [formTaskId, setFormTaskId] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<TimesheetEntry | null>(null)
  const [activeTab, setActiveTab] = useState('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await timesheetEntryApi.getAll({ size: 1000 })
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

  const handleOpenCreate = (date?: Date) => {
    setEditingItem(null)
    setFormEntryDate(date ? format(date, 'yyyy-MM-dd') : '')
    setFormNormalWorkingTime('')
    setFormOvertime('')
    setFormNote('')
    setFormProjectId('')
    setFormTaskId('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: TimesheetEntry) => {
    setEditingItem(item)
    setFormEntryDate(item.entryDate.split('T')[0])
    setFormNormalWorkingTime(String(item.normalWorkingTime))
    setFormOvertime(String(item.overtime))
    setFormNote(item.note || '')
    setFormProjectId(item.projectId)
    setFormTaskId(item.taskId)
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formEntryDate.trim()) {
      toast.error('Vui lòng chọn ngày')
      return
    }
    try {
      const payload = {
        entryDate: new Date(formEntryDate).toISOString(),
        normalWorkingTime: Number(formNormalWorkingTime) || 0,
        overtime: Number(formOvertime) || 0,
        note: formNote.trim() || undefined,
        projectId: formProjectId.trim(),
        taskId: formTaskId.trim(),
      }
      if (editingItem) {
        await timesheetEntryApi.update(editingItem.id, payload)
        toast.success('Cập nhật timesheet thành công')
      } else {
        await timesheetEntryApi.create(payload)
        toast.success('Thêm timesheet thành công')
      }
      setIsFormOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (item: TimesheetEntry) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await timesheetEntryApi.delete(selectedItem.id)
      toast.success('Đã xóa timesheet')
      setDeleteDialogOpen(false)
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa timesheet')
    }
  }

  const handleSubmitTimesheet = async (item: TimesheetEntry) => {
    try {
      await timesheetEntryApi.submit(item.id)
      toast.success('Đã gửi timesheet')
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi timesheet')
    }
  }

  const handleSubmitWeek = async () => {
    const weekStart = startOfWeek(currentMonth, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 1 })
    const draftEntries = items.filter((item) => {
      const d = parseISO(item.entryDate)
      return item.status === 'DRAFT' && d >= weekStart && d <= weekEnd
    })
    if (draftEntries.length === 0) {
      toast.info('Không có timesheet DRAFT nào trong tuần này')
      return
    }
    let success = 0
    let failed = 0
    for (const entry of draftEntries) {
      try {
        await timesheetEntryApi.submit(entry.id)
        success++
      } catch {
        failed++
      }
    }
    if (success > 0) toast.success(`Đã gửi ${success} timesheet`)
    if (failed > 0) toast.error(`${failed} timesheet gửi thất bại`)
    await fetchItems()
  }

  // Calendar data
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const entriesByDate = useMemo(() => {
    const map = new Map<string, TimesheetEntry[]>()
    for (const item of items) {
      const key = item.entryDate.split('T')[0]
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }, [items])

  const dailyTotals = useMemo(() => {
    const map = new Map<string, { normal: number; ot: number }>()
    for (const [date, entries] of entriesByDate) {
      map.set(date, {
        normal: entries.reduce((s, e) => s + (e.normalWorkingTime || 0), 0),
        ot: entries.reduce((s, e) => s + (e.overtime || 0), 0),
      })
    }
    return map
  }, [entriesByDate])

  const goToToday = () => setCurrentMonth(new Date())
  const goToPrevMonth = () => setCurrentMonth((d) => subMonths(d, 1))
  const goToNextMonth = () => setCurrentMonth((d) => addMonths(d, 1))

  const handleMonthChange = (value: string) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(Number(value))
    setCurrentMonth(newDate)
  }

  const handleYearChange = (value: string) => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(Number(value))
    setCurrentMonth(newDate)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Log Timesheet</h1>
          <p className="text-muted-foreground">Ghi nhận thờigian làm việc</p>
        </div>
        <Button onClick={() => handleOpenCreate()}>
          <Plus className="mr-2 size-4" />
          Thêm timesheet
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">
            <List className="mr-2 size-4" />
            Danh sách
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays className="mr-2 size-4" />
            Lịch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách timesheet</CardTitle>
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
                    <EmptyTitle>Chưa có timesheet</EmptyTitle>
                    <EmptyDescription>Bạn chưa ghi nhận timesheet nào.</EmptyDescription>
                  </EmptyHeader>
                  <Button onClick={() => handleOpenCreate()} className="mt-4">
                    <Plus className="mr-2 size-4" />
                    Thêm timesheet đầu tiên
                  </Button>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
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
                        <TableCell className="font-medium">{new Date(item.entryDate).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{item.normalWorkingTime}h</TableCell>
                        <TableCell>{item.overtime}h</TableCell>
                        <TableCell>{statusBadge(item.status)}</TableCell>
                        <TableCell>{item.note || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {item.status === 'DRAFT' && (
                              <Button variant="ghost" size="icon" onClick={() => handleSubmitTimesheet(item)} title="Gửi">
                                <Send className="size-4" />
                                <span className="sr-only">Gửi</span>
                              </Button>
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
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={goToPrevMonth}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Hôm nay
                  </Button>
                  <Button variant="outline" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="size-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Select value={String(currentMonth.getMonth())} onValueChange={handleMonthChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={String(currentMonth.getFullYear())} onValueChange={handleYearChange}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y.value} value={y.value}>
                            {y.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSubmitWeek} variant="secondary">
                  <Send className="mr-2 size-4" />
                  Gửi tuần phê duyệt
                </Button>
              </div>
              <div className="mt-2 text-lg font-semibold capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: vi })}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <div className="space-y-2">
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1">
                    {WEEKDAY_HEADERS.map((h) => (
                      <div
                        key={h}
                        className={`text-center text-sm font-medium py-1 ${h === 'T7' || h === 'CN' ? 'text-red-500' : 'text-muted-foreground'}`}
                      >
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day) => {
                      const dateKey = format(day, 'yyyy-MM-dd')
                      const dayEntries = entriesByDate.get(dateKey) || []
                      const totals = dailyTotals.get(dateKey)
                      const inMonth = isSameMonth(day, currentMonth)
                      const weekend = isWeekend(day)
                      const today = isToday(day)

                      return (
                        <div
                          key={dateKey}
                          onClick={() => inMonth && handleOpenCreate(day)}
                          className={`
                            relative min-h-[100px] rounded-md border p-2 transition-colors
                            ${inMonth ? 'cursor-pointer hover:bg-accent' : 'bg-muted/30 opacity-50'}
                            ${today ? 'ring-2 ring-primary' : ''}
                            ${weekend && inMonth ? 'bg-red-50 dark:bg-red-950/20' : ''}
                          `}
                        >
                          <div className={`text-right text-sm font-semibold ${weekend ? 'text-red-500' : ''}`}>
                            {format(day, 'd')}
                          </div>
                          {dayEntries.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {totals && (
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{totals.normal}h</span>
                                  {totals.ot > 0 && <span className="text-orange-500">+{totals.ot}h OT</span>}
                                </div>
                              )}
                              {dayEntries.slice(0, 2).map((entry) => (
                                <div key={entry.id} className="flex items-center gap-1 text-xs">
                                  {statusDot(entry.status)}
                                  <span className="truncate">{entry.project?.code || entry.projectId}</span>
                                </div>
                              ))}
                              {dayEntries.length > 2 && (
                                <div className="text-xs text-muted-foreground">+{dayEntries.length - 2} khác</div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Summary row */}
                  <div className="grid grid-cols-7 gap-1 pt-2 border-t">
                    {WEEKDAY_HEADERS.map((_, idx) => {
                      const weekDays = calendarDays.filter((d) => getDay(d) === (idx + 1) % 7 && isSameMonth(d, currentMonth))
                      const totalNormal = weekDays.reduce((sum, d) => {
                        const key = format(d, 'yyyy-MM-dd')
                        return sum + (dailyTotals.get(key)?.normal || 0)
                      }, 0)
                      const totalOt = weekDays.reduce((sum, d) => {
                        const key = format(d, 'yyyy-MM-dd')
                        return sum + (dailyTotals.get(key)?.ot || 0)
                      }, 0)
                      return (
                        <div key={idx} className="text-center text-xs">
                          <div className="font-medium">{totalNormal > 0 ? `${totalNormal}h` : '-'}</div>
                          {totalOt > 0 && <div className="text-orange-500">+{totalOt}h OT</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Chỉnh sửa timesheet' : 'Thêm timesheet mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="entryDate">Ngày</Label>
              <Input
                id="entryDate"
                type="date"
                value={formEntryDate}
                onChange={(e) => setFormEntryDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="normalWorkingTime">Giờ làm việc (giờ)</Label>
              <Input
                id="normalWorkingTime"
                type="number"
                placeholder="8"
                value={formNormalWorkingTime}
                onChange={(e) => setFormNormalWorkingTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overtime">Overtime (giờ)</Label>
              <Input
                id="overtime"
                type="number"
                placeholder="0"
                value={formOvertime}
                onChange={(e) => setFormOvertime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                placeholder="Nhập project ID..."
                value={formProjectId}
                onChange={(e) => setFormProjectId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskId">Task ID</Label>
              <Input
                id="taskId"
                placeholder="Nhập task ID..."
                value={formTaskId}
                onChange={(e) => setFormTaskId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Input
                id="note"
                placeholder="Nhập ghi chú..."
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
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
              Bạn có chắc chắn muốn xóa timesheet này? Hành động này không thể hoàn tác.
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
