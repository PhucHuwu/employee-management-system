'use client'

import { useCallback, useEffect, useState } from 'react'
import { Calendar, Clock, FileBarChart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'

interface NormalWorkingReport {
  employeeName: string
  totalHours: number
  entries: number
}

interface OvertimeReport {
  employeeName: string
  totalOvertime: number
  entries: number
}

interface TardinessReport {
  employeeName: string
  deficientHours: number
  entries: number
}

interface ReportFilters {
  startDate: string
  endDate: string
  employeeId?: string
  projectId?: string
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

function ReportTable<T extends { employeeName: string; entries: number }>({
  items,
  columns,
}: {
  items: T[]
  columns: { key: keyof T; label: string; format?: (value: unknown) => string }[]
}) {
  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileBarChart className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Khong co du lieu</EmptyTitle>
          <EmptyDescription>Khong tim thay bao cao nao phu hop voi bo loc da chon</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={String(col.key)}>{col.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, idx) => (
          <TableRow key={`${item.employeeName}-${idx}`}>
            {columns.map((col) => (
              <TableCell key={String(col.key)}>
                {col.format
                  ? col.format(item[col.key])
                  : String(item[col.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

async function fetchNormalWorking(params: ReportFilters): Promise<NormalWorkingReport[]> {
  const searchParams = new URLSearchParams()
  if (params.startDate) searchParams.append('startDate', params.startDate)
  if (params.endDate) searchParams.append('endDate', params.endDate)
  if (params.employeeId) searchParams.append('employeeId', params.employeeId)
  if (params.projectId) searchParams.append('projectId', params.projectId)

  const res = await fetch(`/api/timesheet-reports/normal-working?${searchParams.toString()}`)
  if (!res.ok) {
    throw new Error('Khong tai duoc bao cao gio lam viec binh thuong')
  }
  return res.json()
}

async function fetchOvertime(params: ReportFilters): Promise<OvertimeReport[]> {
  const searchParams = new URLSearchParams()
  if (params.startDate) searchParams.append('startDate', params.startDate)
  if (params.endDate) searchParams.append('endDate', params.endDate)
  if (params.employeeId) searchParams.append('employeeId', params.employeeId)
  if (params.projectId) searchParams.append('projectId', params.projectId)

  const res = await fetch(`/api/timesheet-reports/overtime?${searchParams.toString()}`)
  if (!res.ok) {
    throw new Error('Khong tai duoc bao cao tang ca')
  }
  return res.json()
}

async function fetchTardiness(params: ReportFilters): Promise<TardinessReport[]> {
  const searchParams = new URLSearchParams()
  if (params.startDate) searchParams.append('startDate', params.startDate)
  if (params.endDate) searchParams.append('endDate', params.endDate)
  if (params.employeeId) searchParams.append('employeeId', params.employeeId)
  if (params.projectId) searchParams.append('projectId', params.projectId)

  const res = await fetch(`/api/timesheet-reports/tardiness?${searchParams.toString()}`)
  if (!res.ok) {
    throw new Error('Khong tai duoc bao cao di tre')
  }
  return res.json()
}

export default function TimesheetReportsPage() {
  const [activeTab, setActiveTab] = useState('normal-working')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [projectId, setProjectId] = useState('')

  const [normalWorking, setNormalWorking] = useState<NormalWorkingReport[]>([])
  const [overtime, setOvertime] = useState<OvertimeReport[]>([])
  const [tardiness, setTardiness] = useState<TardinessReport[]>([])

  const [isLoadingNormal, setIsLoadingNormal] = useState(false)
  const [isLoadingOvertime, setIsLoadingOvertime] = useState(false)
  const [isLoadingTardiness, setIsLoadingTardiness] = useState(false)

  const filters: ReportFilters = {
    startDate,
    endDate,
    employeeId: employeeId.trim() || undefined,
    projectId: projectId.trim() || undefined,
  }

  const fetchNormal = useCallback(async () => {
    if (!startDate || !endDate) return
    setIsLoadingNormal(true)
    try {
      const data = await fetchNormalWorking(filters)
      setNormalWorking(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Loi tai bao cao')
    } finally {
      setIsLoadingNormal(false)
    }
  }, [startDate, endDate, employeeId, projectId])

  const fetchOt = useCallback(async () => {
    if (!startDate || !endDate) return
    setIsLoadingOvertime(true)
    try {
      const data = await fetchOvertime(filters)
      setOvertime(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Loi tai bao cao')
    } finally {
      setIsLoadingOvertime(false)
    }
  }, [startDate, endDate, employeeId, projectId])

  const fetchLate = useCallback(async () => {
    if (!startDate || !endDate) return
    setIsLoadingTardiness(true)
    try {
      const data = await fetchTardiness(filters)
      setTardiness(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Loi tai bao cao')
    } finally {
      setIsLoadingTardiness(false)
    }
  }, [startDate, endDate, employeeId, projectId])

  useEffect(() => {
    if (startDate && endDate) {
      void fetchNormal()
      void fetchOt()
      void fetchLate()
    }
  }, [fetchNormal, fetchOt, fetchLate, startDate, endDate])

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')
    setEmployeeId('')
    setProjectId('')
    setNormalWorking([])
    setOvertime([])
    setTardiness([])
  }

  const totalNormal = normalWorking.reduce((sum, item) => sum + item.totalHours, 0)
  const totalOt = overtime.reduce((sum, item) => sum + item.totalOvertime, 0)
  const totalDeficient = tardiness.reduce((sum, item) => sum + item.deficientHours, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timesheet Reports</h1>
        <p className="text-muted-foreground">Xem va quan ly bao cao timesheet tong hop</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="size-5" />
            Bo loc
          </CardTitle>
          <CardDescription>Chon khoang thoi gian va bo loc de xem bao cao</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Tu ngay"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Den ngay"
              />
            </div>
            <Input
              placeholder="Nhan vien ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
            <Input
              placeholder="Du an ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
            <Button variant="outline" onClick={handleClearFilters}>
              Xoa bo loc
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="normal-working">Gio lam viec binh thuong</TabsTrigger>
          <TabsTrigger value="overtime">Tang ca</TabsTrigger>
          <TabsTrigger value="tardiness">Di tre</TabsTrigger>
        </TabsList>

        <TabsContent value="normal-working">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Bao cao gio lam viec binh thuong</CardTitle>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-sm">
                    <Clock className="mr-1 size-3" />
                    {totalNormal.toFixed(1)} gio
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {normalWorking.length} nhan vien
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingNormal ? (
                <TableSkeleton />
              ) : !startDate || !endDate ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Calendar className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Chon khoang thoi gian</EmptyTitle>
                    <EmptyDescription>Vui long chon ngay bat dau va ngay ket thuc de xem bao cao</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ReportTable
                  items={normalWorking}
                  columns={[
                    { key: 'employeeName', label: 'Nhan vien' },
                    { key: 'totalHours', label: 'Tong gio', format: (v) => `${Number(v).toFixed(1)}h` },
                    { key: 'entries', label: 'So ban ghi' },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overtime">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Bao cao tang ca</CardTitle>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-sm">
                    <Clock className="mr-1 size-3" />
                    {totalOt.toFixed(1)} gio
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {overtime.length} nhan vien
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingOvertime ? (
                <TableSkeleton />
              ) : !startDate || !endDate ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Calendar className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Chon khoang thoi gian</EmptyTitle>
                    <EmptyDescription>Vui long chon ngay bat dau va ngay ket thuc de xem bao cao</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ReportTable
                  items={overtime}
                  columns={[
                    { key: 'employeeName', label: 'Nhan vien' },
                    { key: 'totalOvertime', label: 'Tong tang ca', format: (v) => `${Number(v).toFixed(1)}h` },
                    { key: 'entries', label: 'So ban ghi' },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tardiness">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Bao cao di tre</CardTitle>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-sm">
                    <Clock className="mr-1 size-3" />
                    {totalDeficient.toFixed(1)} gio thieu
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {tardiness.length} nhan vien
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTardiness ? (
                <TableSkeleton />
              ) : !startDate || !endDate ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Calendar className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Chon khoang thoi gian</EmptyTitle>
                    <EmptyDescription>Vui long chon ngay bat dau va ngay ket thuc de xem bao cao</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ReportTable
                  items={tardiness}
                  columns={[
                    { key: 'employeeName', label: 'Nhan vien' },
                    { key: 'deficientHours', label: 'Gio thieu hut', format: (v) => `${Number(v).toFixed(1)}h` },
                    { key: 'entries', label: 'So ban ghi' },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
