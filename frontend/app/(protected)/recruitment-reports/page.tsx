'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, Users, Briefcase, UserCheck, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { branchApi } from '@/lib/api/endpoints'
import type { Branch } from '@/lib/types'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface OverviewData {
  candidatesByStatus: Record<string, number>
  requisitionsByStatus: Record<string, number>
  candidatesBySource: Record<string, number>
}

interface SourceItem {
  source: string
  count: number
}

interface StaffSourcesData {
  items: SourceItem[]
}

interface InternSourcesData {
  items: SourceItem[]
}

interface InternEducationItem {
  education: string
  count: number
}

interface InternEducationsData {
  items: InternEducationItem[]
}

const PIE_COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6']

function getDefaultDateRange() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    startDate: firstDay.toISOString().slice(0, 10),
    endDate: lastDay.toISOString().slice(0, 10),
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: number | string
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

function StatusDistributionCard({
  title,
  data,
  isLoading,
}: {
  title: string
  data: Record<string, number>
  isLoading: boolean
}) {
  const chartData = useMemo(
    () =>
      Object.entries(data).map(([name, value]) => ({
        name,
        value,
      })),
    [data]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px]">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có dữ liệu.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

function SourceBarChart({
  data,
  isLoading,
}: {
  data: SourceItem[]
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Phân bổ theo nguồn</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có dữ liệu.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

function SourceTable({
  data,
  isLoading,
}: {
  data: SourceItem[]
  isLoading: boolean
}) {
  if (isLoading) {
    return <TableSkeleton />
  }

  if (data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BarChart3 className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Không có dữ liệu</EmptyTitle>
          <EmptyDescription>Không tìm thấy dữ liệu phù hợp với bộ lọc.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nguồn</TableHead>
          <TableHead className="text-right">Số lượng</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, idx) => (
          <TableRow key={`${item.source}-${idx}`}>
            <TableCell className="font-medium">{item.source || '-'}</TableCell>
            <TableCell className="text-right">{item.count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function EducationTable({
  data,
  isLoading,
}: {
  data: InternEducationItem[]
  isLoading: boolean
}) {
  if (isLoading) {
    return <TableSkeleton />
  }

  if (data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <GraduationCap className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Không có dữ liệu</EmptyTitle>
          <EmptyDescription>Không tìm thấy dữ liệu phù hợp với bộ lọc.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trường / Bằng cấp</TableHead>
          <TableHead className="text-right">Số lượng</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, idx) => (
          <TableRow key={`${item.education}-${idx}`}>
            <TableCell className="font-medium">{item.education || '-'}</TableCell>
            <TableCell className="text-right">{item.count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function RecruitmentReportsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [startDate, setStartDate] = useState(getDefaultDateRange().startDate)
  const [endDate, setEndDate] = useState(getDefaultDateRange().endDate)

  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  const [staffSources, setStaffSources] = useState<SourceItem[]>([])
  const [staffSourcesLoading, setStaffSourcesLoading] = useState(false)

  const [internSources, setInternSources] = useState<SourceItem[]>([])
  const [internSourcesLoading, setInternSourcesLoading] = useState(false)

  const [internEducations, setInternEducations] = useState<InternEducationItem[]>([])
  const [internEducationsLoading, setInternEducationsLoading] = useState(false)

  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState('')

  useEffect(() => {
    void branchApi.getAll({ size: 100 }).then((data) => {
      setBranches(data.items)
    })
  }, [])

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true)
    try {
      const data = await fetch('/api/recruitment/overview').then((res) => {
        if (!res.ok) throw new Error('Không tải được dữ liệu tổng quan')
        return res.json() as Promise<OverviewData>
      })
      setOverview(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được dữ liệu tổng quan')
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  const fetchStaffSources = useCallback(async () => {
    setStaffSourcesLoading(true)
    try {
      const data = await fetch(
        `/api/recruitment/staff-sources?startDate=${startDate}&endDate=${endDate}`
      ).then((res) => {
        if (!res.ok) throw new Error('Không tải được dữ liệu nguồn nhân viên')
        return res.json() as Promise<StaffSourcesData>
      })
      setStaffSources(data.items ?? [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được dữ liệu nguồn nhân viên')
    } finally {
      setStaffSourcesLoading(false)
    }
  }, [startDate, endDate])

  const fetchInternSources = useCallback(async () => {
    setInternSourcesLoading(true)
    try {
      const data = await fetch(
        `/api/recruitment/intern-sources?startDate=${startDate}&endDate=${endDate}`
      ).then((res) => {
        if (!res.ok) throw new Error('Không tải được dữ liệu nguồn intern')
        return res.json() as Promise<InternSourcesData>
      })
      setInternSources(data.items ?? [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được dữ liệu nguồn intern')
    } finally {
      setInternSourcesLoading(false)
    }
  }, [startDate, endDate])

  const fetchInternEducations = useCallback(async () => {
    setInternEducationsLoading(true)
    try {
      const url = new URL('/api/recruitment/intern-educations', window.location.origin)
      url.searchParams.set('startDate', startDate)
      url.searchParams.set('endDate', endDate)
      if (selectedBranchId) {
        url.searchParams.set('branchId', selectedBranchId)
      }
      const data = await fetch(url.toString()).then((res) => {
        if (!res.ok) throw new Error('Không tải được dữ liệu học vấn intern')
        return res.json() as Promise<InternEducationsData>
      })
      setInternEducations(data.items ?? [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được dữ liệu học vấn intern')
    } finally {
      setInternEducationsLoading(false)
    }
  }, [startDate, endDate, selectedBranchId])

  useEffect(() => {
    void fetchOverview()
  }, [fetchOverview])

  useEffect(() => {
    if (activeTab === 'staff-sources') {
      void fetchStaffSources()
    }
  }, [activeTab, fetchStaffSources])

  useEffect(() => {
    if (activeTab === 'intern-sources') {
      void fetchInternSources()
    }
  }, [activeTab, fetchInternSources])

  useEffect(() => {
    if (activeTab === 'intern-educations') {
      void fetchInternEducations()
    }
  }, [activeTab, fetchInternEducations])

  const totalCandidates = useMemo(() => {
    if (!overview?.candidatesByStatus) return 0
    return Object.values(overview.candidatesByStatus).reduce((a, b) => a + b, 0)
  }, [overview])

  const totalRequisitions = useMemo(() => {
    if (!overview?.requisitionsByStatus) return 0
    return Object.values(overview.requisitionsByStatus).reduce((a, b) => a + b, 0)
  }, [overview])

  const totalSources = useMemo(() => {
    if (!overview?.candidatesBySource) return 0
    return Object.values(overview.candidatesBySource).reduce((a, b) => a + b, 0)
  }, [overview])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo tuyển dụng</h1>
          <p className="text-muted-foreground">Thống kê và phân tích tuyển dụng</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="staff-sources">Nguồn nhân viên</TabsTrigger>
          <TabsTrigger value="intern-sources">Nguồn intern</TabsTrigger>
          <TabsTrigger value="intern-educations">Học vấn intern</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {overviewLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
                <StatCard title="Tổng ứng viên" value={totalCandidates} icon={Users} />
                <StatCard title="Tổng yêu cầu tuyển dụng" value={totalRequisitions} icon={Briefcase} />
                <StatCard title="Tổng nguồn ứng viên" value={totalSources} icon={UserCheck} />
              </>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <StatusDistributionCard
              title="Ứng viên theo trạng thái"
              data={overview?.candidatesByStatus ?? {}}
              isLoading={overviewLoading}
            />
            <StatusDistributionCard
              title="Yêu cầu tuyển dụng theo trạng thái"
              data={overview?.requisitionsByStatus ?? {}}
              isLoading={overviewLoading}
            />
            <StatusDistributionCard
              title="Ứng viên theo nguồn"
              data={overview?.candidatesBySource ?? {}}
              isLoading={overviewLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="staff-sources" className="space-y-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onApply={fetchStaffSources}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <SourceBarChart data={staffSources} isLoading={staffSourcesLoading} />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chi tiết nguồn nhân viên</CardTitle>
              </CardHeader>
              <CardContent>
                <SourceTable data={staffSources} isLoading={staffSourcesLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intern-sources" className="space-y-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onApply={fetchInternSources}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <SourceBarChart data={internSources} isLoading={internSourcesLoading} />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chi tiết nguồn intern</CardTitle>
              </CardHeader>
              <CardContent>
                <SourceTable data={internSources} isLoading={internSourcesLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intern-educations" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="edu-start">Từ ngày</Label>
                <Input
                  id="edu-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edu-end">Đến ngày</Label>
                <Input
                  id="edu-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edu-branch">Chi nhánh</Label>
                <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                  <SelectTrigger id="edu-branch" className="w-48">
                    <SelectValue placeholder="Tất cả chi nhánh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả chi nhánh</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="sm:ml-auto">
              <button
                onClick={() => void fetchInternEducations()}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Áp dụng
              </button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chi tiết học vấn intern</CardTitle>
            </CardHeader>
            <CardContent>
              <EducationTable data={internEducations} isLoading={internEducationsLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onApply: () => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Label>Từ ngày</Label>
          <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Đến ngày</Label>
          <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
        </div>
      </div>
      <div className="sm:ml-auto">
        <button
          onClick={() => void onApply()}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Áp dụng
        </button>
      </div>
    </div>
  )
}
