'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, Clock, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { DailyReport, Employee, Project } from '@/lib/types'
import { dailyReportApi, employeeApi, projectApi } from '@/lib/api/endpoints'

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function DailyReportsPage() {
  const [reports, setReports] = useState<DailyReport[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [reportsRes, employeesRes, projectsRes] = await Promise.all([
        dailyReportApi.getAll({
          employeeId: selectedEmployee === 'all' ? undefined : selectedEmployee,
          projectId: selectedProject === 'all' ? undefined : selectedProject,
          from: dateFrom || undefined,
          to: dateTo || undefined,
          size: 100,
        }),
        employeeApi.getAll({ size: 100 }),
        projectApi.getAll({ size: 100 }),
      ])

      setReports(reportsRes.items)
      setEmployees(employeesRes.items)
      setProjects(projectsRes.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được báo cáo ngày')
    } finally {
      setIsLoading(false)
    }
  }, [selectedEmployee, selectedProject, dateFrom, dateTo])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const totalReports = reports.length

  const handleClearFilters = () => {
    setSelectedEmployee('all')
    setSelectedProject('all')
    setDateFrom('')
    setDateTo('')
  }

  const rows = useMemo(() => reports, [reports])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Daily Report</h1>
        <p className="text-muted-foreground">Xem và quản lý báo cáo công việc hàng ngày của nhân viên</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="size-5" />Bộ lọc</CardTitle>
          <CardDescription>Chọn nhân viên, dự án và khoảng thời gian để xem báo cáo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger><SelectValue placeholder="Chọn nhân viên" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhân viên</SelectItem>
                {employees.map((emp) => <SelectItem key={emp.id} value={emp.id}>{emp.fullName}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger><SelectValue placeholder="Chọn dự án" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả dự án</SelectItem>
                {projects.map((proj) => <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2"><Calendar className="size-4 text-muted-foreground" /><Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="Từ ngày" /></div>
            <div className="flex items-center gap-2"><Calendar className="size-4 text-muted-foreground" /><Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="Đến ngày" /></div>
            <Button variant="outline" onClick={handleClearFilters}>Xóa bộ lọc</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Danh sách báo cáo</CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm"><Clock className="mr-1 size-3" />{totalReports} báo cáo</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><FileText className="size-5" /></EmptyMedia>
                <EmptyTitle>Không có báo cáo</EmptyTitle>
                <EmptyDescription>Không tìm thấy báo cáo nào phù hợp với bộ lọc đã chọn</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Ngày</TableHead><TableHead>Nhân viên</TableHead><TableHead>Dự án</TableHead><TableHead>Tác vụ</TableHead><TableHead className="max-w-md">Nội dung công việc</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{new Date(report.reportDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="font-medium">{report.employee?.fullName || report.employeeId}</TableCell>
                    <TableCell><Badge variant="outline">{report.project?.name || '-'}</Badge></TableCell>
                    <TableCell>{report.task}</TableCell>
                    <TableCell className="max-w-md"><p className="line-clamp-2">{report.workContent}</p></TableCell>
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
