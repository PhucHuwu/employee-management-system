'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Users,
  Clock,
  FolderKanban,
  Calendar,
  FileText,
  Activity,
  TrendingUp,
  AlertTriangle,
  PieChart,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/auth-context'
import { employeeApi, projectApi, scheduleApi, dailyReportApi, analyticsApi } from '@/lib/api/endpoints'
import { Progress } from '@/components/ui/progress'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface DashboardStats {
  activeEmployees: number
  inactiveEmployees: number
  totalEmployees: number
  pendingRequests: number
  runningProjects: number
  totalProjects: number
  todayOff: number
  todayRemote: number
  totalRevenueActual: number
  totalRevenueForecast: number
  overdueProjects: number
  missingDailyReports: number
}

interface MonthlyPoint {
  date: string
  off: number
  remote: number
}

interface RevenueMonth {
  month: number
  forecast: number
  actual: number
}

interface ProjectStatusPoint {
  name: string
  value: number
  color: string
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
}: {
  title: string
  value: number | string
  description?: string
  icon: React.ElementType
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger'
}) {
  const gradients: Record<string, string> = {
    default: 'from-slate-500 to-slate-600',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-amber-500 to-amber-600',
    info: 'from-sky-500 to-sky-600',
    danger: 'from-rose-500 to-rose-600',
  }

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div className={`bg-gradient-to-r ${gradients[variant]} p-5 text-white`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium opacity-90">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && <p className="text-xs opacity-80">{description}</p>}
          </div>
          <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
            <Icon className="size-5 text-white" />
          </div>
        </div>
      </div>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

const PIE_COLORS = ['#0ea5e9', '#f59e0b', '#10b981']
const MONTH_NAMES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlySummary, setMonthlySummary] = useState<MonthlyPoint[]>([])
  const [pendingRequests, setPendingRequests] = useState<Array<{ id: string; employeeName: string; requestType: string; requestDate: string }>>([])
  const [topProjects, setTopProjects] = useState<Array<{ id: string; name: string; members: number; documents: number }>>([])
  const [recentReports, setRecentReports] = useState<Array<{ id: string; employeeName: string; projectName: string; task: string; reportDate: string }>>([])

  const [revenueData, setRevenueData] = useState<RevenueMonth[]>([])
  const [projectStatusData, setProjectStatusData] = useState<ProjectStatusPoint[]>([])
  const [exceptions, setExceptions] = useState<{
    overdueProjects: Array<{ id: string; code: string; name: string; endDate: string }>
    missingDailyReports: Array<{ employeeId: string; fullName: string; missingDays: number }>
  }>({ overdueProjects: [], missingDailyReports: [] })
  const [utilization, setUtilization] = useState<{
    employees: Array<{ employeeId: string; fullName: string; projectCount: number }>
    avgProjectsPerEmployee: number
  }>({ employees: [], avgProjectsPerEmployee: 0 })

  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const monthFrom = firstOfMonth.toISOString().slice(0, 10)
      const currentYear = new Date().getFullYear()

      const [
        activeEmployees,
        inactiveEmployees,
        pending,
        runningProjects,
        allProjects,
        todaySummary,
        monthSummary,
        reports,
        summary,
        revenue,
        exceptionData,
        utilizationData,
      ] = await Promise.all([
        employeeApi.getAll({ status: 'ACTIVE', size: 1 }),
        employeeApi.getAll({ status: 'INACTIVE', size: 1 }),
        scheduleApi.getRequests({ status: 'PENDING', size: 8 }),
        projectApi.getAll({ status: 'RUNNING', size: 1 }),
        projectApi.getAll({ size: 100 }),
        scheduleApi.getDailySummary({ from: today, to: today }),
        scheduleApi.getDailySummary({ from: monthFrom, to: today }),
        dailyReportApi.getAll({ size: 8 }),
        analyticsApi.getDashboardSummary(),
        analyticsApi.getRevenue({ year: currentYear }),
        analyticsApi.getExceptionReports(),
        analyticsApi.getResourceUtilization(),
      ])

      const todaySummaryItem = todaySummary[0]
      const todayOff =
        (todaySummaryItem?.counts?.OFF_FULL_DAY ?? todaySummaryItem?.offFullDay ?? 0) +
        (todaySummaryItem?.counts?.OFF_AM ?? todaySummaryItem?.offAM ?? 0) +
        (todaySummaryItem?.counts?.OFF_PM ?? todaySummaryItem?.offPM ?? 0)
      const todayRemote =
        (todaySummaryItem?.counts?.REMOTE_FULL_DAY ?? todaySummaryItem?.remoteFullDay ?? 0) +
        (todaySummaryItem?.counts?.REMOTE_AM ?? todaySummaryItem?.remoteAM ?? 0) +
        (todaySummaryItem?.counts?.REMOTE_PM ?? todaySummaryItem?.remotePM ?? 0)

      setMonthlySummary(
        monthSummary.map((d) => ({
          date: d.date.slice(8, 10),
          off:
            (d.counts?.OFF_FULL_DAY ?? d.offFullDay ?? 0) +
            (d.counts?.OFF_AM ?? d.offAM ?? 0) +
            (d.counts?.OFF_PM ?? d.offPM ?? 0),
          remote:
            (d.counts?.REMOTE_FULL_DAY ?? d.remoteFullDay ?? 0) +
            (d.counts?.REMOTE_AM ?? d.remoteAM ?? 0) +
            (d.counts?.REMOTE_PM ?? d.remotePM ?? 0),
        }))
      )

      setPendingRequests(
        pending.items.slice(0, 8).map((r) => ({
          id: r.id,
          employeeName: r.employee?.fullName || '-',
          requestType: r.requestType,
          requestDate: r.requestDate,
        }))
      )

      setTopProjects(
        [...allProjects.items]
          .sort((a, b) => (b._count?.members || 0) - (a._count?.members || 0))
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            name: p.name,
            members: p._count?.members || 0,
            documents: p._count?.documents || 0,
          }))
      )

      setRecentReports(
        reports.items.slice(0, 8).map((r) => ({
          id: r.id,
          employeeName: r.employee?.fullName || '-',
          projectName: r.project?.name || '-',
          task: r.task,
          reportDate: r.reportDate,
        }))
      )

      setStats({
        activeEmployees: activeEmployees.total,
        inactiveEmployees: inactiveEmployees.total,
        totalEmployees: activeEmployees.total + inactiveEmployees.total,
        pendingRequests: pending.total,
        runningProjects: runningProjects.total,
        totalProjects: allProjects.total,
        todayOff,
        todayRemote,
        totalRevenueActual: summary.totalRevenueActual || 0,
        totalRevenueForecast: summary.totalRevenueForecast || 0,
        overdueProjects: summary.overdueProjects || 0,
        missingDailyReports: summary.missingDailyReports || 0,
      })

      setRevenueData(
        revenue.months.map((m) => ({
          ...m,
          name: MONTH_NAMES[m.month - 1],
        }))
      )

      setProjectStatusData([
        { name: 'Đang chạy', value: summary.projectCount?.running || 0, color: PIE_COLORS[0] },
        { name: 'Tạm dừng', value: summary.projectCount?.paused || 0, color: PIE_COLORS[1] },
        { name: 'Kết thúc', value: summary.projectCount?.ended || 0, color: PIE_COLORS[2] },
      ])

      setExceptions({
        overdueProjects: exceptionData.overdueProjects || [],
        missingDailyReports: exceptionData.missingDailyReports || [],
      })

      setUtilization({
        employees: (utilizationData.employees || []).slice(0, 8),
        avgProjectsPerEmployee: utilizationData.avgProjectsPerEmployee || 0,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  const activePercent = useMemo(() => {
    if (!stats?.totalEmployees) return 0
    return Math.round((stats.activeEmployees / stats.totalEmployees) * 100)
  }, [stats])

  const revenueTotal = useMemo(() => {
    const total = revenueData.reduce((acc, m) => acc + m.actual, 0)
    return total.toLocaleString('vi-VN')
  }, [revenueData])

  const statusColor = (type: string): 'destructive' | 'secondary' | 'outline' => {
    if (type.startsWith('OFF')) return 'destructive'
    if (type.startsWith('REMOTE')) return 'secondary'
    return 'outline'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hệ thống quản lý nhân sự</p>
        </div>
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Xin chào, {user?.fullName || 'Quản trị viên'}! Đây là tổng quan hệ thống.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Nhân viên đang hoạt động"
          value={stats?.activeEmployees || 0}
          description={`${stats?.inactiveEmployees || 0} nhân viên ngừng hoạt động`}
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Yêu cầu chờ duyệt"
          value={stats?.pendingRequests || 0}
          description="Yêu cầu nghỉ/remote"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Dự án đang chạy"
          value={stats?.runningProjects || 0}
          description={`Tổng ${stats?.totalProjects || 0} dự án`}
          icon={FolderKanban}
          variant="info"
        />
        <StatCard
          title="Nghỉ/Remote hôm nay"
          value={`${stats?.todayOff || 0}/${stats?.todayRemote || 0}`}
          description="Nghỉ / Remote"
          icon={Calendar}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Doanh thu thực tế"
          value={`${revenueTotal} USD`}
          description={`Dự kiến: ${(stats?.totalRevenueForecast || 0).toLocaleString('vi-VN')} USD`}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Dự án trễ hạn"
          value={stats?.overdueProjects || 0}
          description="Dự án quá hạn chưa kết thúc"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          title="Thiếu Daily Report"
          value={stats?.missingDailyReports || 0}
          description="Nhân viên chưa báo cáo > 2 ngày"
          icon={FileText}
          variant="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cơ cấu nhân sự</CardTitle>
            <CardDescription>Tỷ lệ nhân sự đang hoạt động</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Đang hoạt động</span>
              <span className="font-medium">
                {stats?.activeEmployees || 0} ({activePercent}%)
              </span>
            </div>
            <Progress value={activePercent} />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Ngừng hoạt động</span>
              <span>{stats?.inactiveEmployees || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4" />
              Xu hướng nghỉ / remote trong tháng
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <Tooltip />
                <Area type="monotone" dataKey="off" stackId="1" stroke="#ef4444" fill="#fecaca" name="Nghỉ" />
                <Area type="monotone" dataKey="remote" stackId="1" stroke="#0ea5e9" fill="#bae6fd" name="Remote" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4" />
              Doanh thu: Dự kiến vs Thực tế
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${Number(value).toLocaleString('vi-VN')} USD`} />
                <Legend />
                <Bar dataKey="forecast" fill="#94a3b8" name="Dự kiến" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#0ea5e9" name="Thực tế" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="size-4" />
              Phân bổ trạng thái dự án
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" />
              Cảnh báo ngoại lệ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exceptions.overdueProjects.length === 0 && exceptions.missingDailyReports.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có ngoại lệ nào được phát hiện.</p>
            ) : (
              <>
                {exceptions.overdueProjects.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">Dự án trễ hạn</p>
                    {exceptions.overdueProjects.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.code} — Hết hạn: {new Date(p.endDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <Badge variant="destructive">Trễ hạn</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {exceptions.missingDailyReports.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-amber-600">Thiếu Daily Report</p>
                    {exceptions.missingDailyReports.map((e) => (
                      <div key={e.employeeId} className="flex items-center justify-between rounded-lg border p-3">
                        <p className="text-sm font-medium">{e.fullName}</p>
                        <Badge variant="outline">{e.missingDays} ngày</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4" />
              Tải công việc nhân sự
            </CardTitle>
            <CardDescription>
              Trung bình {utilization.avgProjectsPerEmployee.toFixed(1)} dự án / nhân viên
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {utilization.employees.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu phân bổ.</p>
            ) : (
              utilization.employees.map((emp) => (
                <div key={emp.employeeId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{emp.fullName}</span>
                    <span className="font-medium">{emp.projectCount} dự án</span>
                  </div>
                  <Progress value={Math.min((emp.projectCount / Math.max(utilization.avgProjectsPerEmployee * 2, 1)) * 100, 100)} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Yêu cầu chờ duyệt gần nhất</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có yêu cầu chờ duyệt.</p>
            ) : (
              pendingRequests.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{item.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.requestDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <Badge variant={statusColor(item.requestType)}>{item.requestType}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top dự án theo nhân sự</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu dự án.</p>
            ) : (
              topProjects.map((project) => (
                <div key={project.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{project.name}</p>
                    <Badge variant="outline">{project.members} thành viên</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{project.documents} tài liệu</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4" />
            Báo cáo công việc gần đây
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có báo cáo công việc.</p>
          ) : (
            recentReports.map((report) => (
              <div key={report.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{report.task}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.employeeName} - {report.projectName}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {new Date(report.reportDate).toLocaleDateString('vi-VN')}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
