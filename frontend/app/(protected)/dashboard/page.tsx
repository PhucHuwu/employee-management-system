'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Users, Clock, FolderKanban, Calendar, FileText, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/auth-context'
import { employeeApi, projectApi, scheduleApi, dailyReportApi } from '@/lib/api/endpoints'
import { Progress } from '@/components/ui/progress'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
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
}

interface MonthlyPoint {
  date: string
  off: number
  remote: number
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
  variant?: 'default' | 'success' | 'warning' | 'info'
}) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${variants[variant]}`}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
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

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlySummary, setMonthlySummary] = useState<MonthlyPoint[]>([])
  const [pendingRequests, setPendingRequests] = useState<Array<{ id: string; employeeName: string; requestType: string; requestDate: string }>>([])
  const [topProjects, setTopProjects] = useState<Array<{ id: string; name: string; members: number; documents: number }>>([])
  const [recentReports, setRecentReports] = useState<Array<{ id: string; employeeName: string; projectName: string; task: string; reportDate: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const monthFrom = firstOfMonth.toISOString().slice(0, 10)

      const [
        activeEmployees,
        inactiveEmployees,
        pending,
        runningProjects,
        allProjects,
        todaySummary,
        monthSummary,
        reports,
      ] = await Promise.all([
        employeeApi.getAll({ status: 'ACTIVE', size: 1 }),
        employeeApi.getAll({ status: 'INACTIVE', size: 1 }),
        scheduleApi.getRequests({ status: 'PENDING', size: 8 }),
        projectApi.getAll({ status: 'RUNNING', size: 1 }),
        projectApi.getAll({ size: 100 }),
        scheduleApi.getDailySummary({ from: today, to: today }),
        scheduleApi.getDailySummary({ from: monthFrom, to: today }),
        dailyReportApi.getAll({ size: 8 }),
      ])

      const todaySummaryItem = todaySummary[0]
      const todayOff = (todaySummaryItem?.counts?.OFF_FULL_DAY ?? todaySummaryItem?.offFullDay ?? 0) +
        (todaySummaryItem?.counts?.OFF_AM ?? todaySummaryItem?.offAM ?? 0) +
        (todaySummaryItem?.counts?.OFF_PM ?? todaySummaryItem?.offPM ?? 0)
      const todayRemote = (todaySummaryItem?.counts?.REMOTE_FULL_DAY ?? todaySummaryItem?.remoteFullDay ?? 0) +
        (todaySummaryItem?.counts?.REMOTE_AM ?? todaySummaryItem?.remoteAM ?? 0) +
        (todaySummaryItem?.counts?.REMOTE_PM ?? todaySummaryItem?.remotePM ?? 0)

      setMonthlySummary(
        monthSummary.map((d) => ({
          date: d.date.slice(8, 10),
          off: (d.counts?.OFF_FULL_DAY ?? d.offFullDay ?? 0) + (d.counts?.OFF_AM ?? d.offAM ?? 0) + (d.counts?.OFF_PM ?? d.offPM ?? 0),
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
        <p className="text-muted-foreground">Xin chào, {user?.fullName || 'Quản trị viên'}! Đây là tổng quan hệ thống.</p>
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

      <div className="flex gap-3">
        <Badge variant="destructive">Nghỉ hôm nay: {stats?.todayOff || 0}</Badge>
        <Badge variant="secondary">Remote hôm nay: {stats?.todayRemote || 0}</Badge>
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
              <span className="font-medium">{stats?.activeEmployees || 0} ({activePercent}%)</span>
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
                    <p className="text-xs text-muted-foreground">{new Date(item.requestDate).toLocaleDateString('vi-VN')}</p>
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
                    <p className="text-xs text-muted-foreground">{report.employeeName} - {report.projectName}</p>
                  </div>
                  <Badge variant="secondary">{new Date(report.reportDate).toLocaleDateString('vi-VN')}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

    </div>
  )
}
