'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Award, MapPin, Calendar, Briefcase, Users, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { EmployeeDetail, FixedSchedule, EmployeeStatus } from '@/lib/types'
import { EmployeeForm } from '@/components/employees/employee-form'
import { employeeApi } from '@/lib/api/endpoints'
import { useAuth } from '@/lib/auth-context'

const statusLabels: Record<EmployeeStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
}

const scheduleLabels: Record<FixedSchedule, string> = {
  SHIFT_8_5: '8:00 - 17:00',
  SHIFT_9_6: '9:00 - 18:00',
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Skeleton className="size-8 rounded" /><Skeleton className="h-8 w-48" /></div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1"><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-6 w-24" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const fetchEmployee = useCallback(async () => {
    if (!user?.employeeId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const data = await employeeApi.getById(user.employeeId)
      setEmployee(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được thông tin nhân viên')
      setEmployee(null)
    } finally {
      setIsLoading(false)
    }
  }, [user?.employeeId])

  useEffect(() => {
    void fetchEmployee()
  }, [fetchEmployee])

  const latestTitle = useMemo(() => employee?.titleHistories?.[0]?.newJobTitle?.name, [employee])

  if (isLoading) return <DetailSkeleton />

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Users className="size-5" /></EmptyMedia>
            <EmptyTitle>Không tìm thấy hồ sơ</EmptyTitle>
            <EmptyDescription>Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const initials = employee.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={undefined} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{employee.fullName}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant={employee.employmentStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                {statusLabels[employee.employmentStatus]}
              </Badge>
              {latestTitle && <span className="text-sm">{latestTitle}</span>}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
          <Pencil className="mr-2 size-4" />Chỉnh sửa
        </Button>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="projects">Dự án</TabsTrigger>
          <TabsTrigger value="history">Lịch sử thăng tiến</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="size-5" />Thông tin cá nhân</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">Ngày sinh</p><p className="flex items-center gap-2 font-medium"><Calendar className="size-4 text-muted-foreground" />{new Date(employee.dob).toLocaleDateString('vi-VN')}</p></div>
                <Separator />
                <div className="space-y-1"><p className="text-sm text-muted-foreground">Địa chỉ</p><p className="flex items-center gap-2 font-medium"><MapPin className="size-4 text-muted-foreground" />{employee.address}</p></div>
                <Separator />
                <div className="space-y-1"><p className="text-sm text-muted-foreground">Lịch làm việc cố định</p><p className="flex items-center gap-2 font-medium"><Briefcase className="size-4 text-muted-foreground" />{scheduleLabels[employee.fixedSchedule]}</p></div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="size-5" />Thông tin công việc</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">Phòng ban</p><p className="font-medium">{employee.department?.name || '-'}</p></div>
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">Vị trí</p><p className="font-medium">{employee.position?.name || '-'}</p></div>
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">Ngày bắt đầu</p><p className="font-medium">{new Date(employee.createdAt).toLocaleDateString('vi-VN')}</p></div>
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">Chức danh hiện tại</p><p className="font-medium">{latestTitle || '-'}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="size-5" />Dự án tham gia</CardTitle></CardHeader>
            <CardContent>
              {!employee.projectMembers || employee.projectMembers.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><Award className="size-5" /></EmptyMedia>
                    <EmptyTitle>Chưa tham gia dự án</EmptyTitle>
                    <EmptyDescription>Nhân viên này chưa được phân công vào dự án nào.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Dự án</TableHead><TableHead>Vai trò</TableHead><TableHead>Ngày tham gia</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {employee.projectMembers.map((pm) => (
                      <TableRow key={pm.id}>
                        <TableCell className="font-medium">{pm.project?.name || pm.projectId}</TableCell>
                        <TableCell>{pm.roleInProject || '-'}</TableCell>
                        <TableCell>{pm.joinedAt ? new Date(pm.joinedAt).toLocaleDateString('vi-VN') : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="size-5" />Lịch sử thăng tiến</CardTitle></CardHeader>
            <CardContent>
              {!employee.titleHistories || employee.titleHistories.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><Award className="size-5" /></EmptyMedia>
                    <EmptyTitle>Chưa có lịch sử thăng tiến</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Chức danh cũ</TableHead><TableHead>Chức danh mới</TableHead><TableHead>Ngày hiệu lực</TableHead><TableHead>Lý do</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {employee.titleHistories.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>{h.oldJobTitle?.name || '-'}</TableCell>
                        <TableCell className="font-medium">{h.newJobTitle.name}</TableCell>
                        <TableCell>{new Date(h.effectiveDate).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{h.reason || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Chỉnh sửa hồ sơ</DialogTitle></DialogHeader>
          {employee && (
            <EmployeeForm
              employee={employee}
              onSuccess={() => { setIsEditOpen(false); void fetchEmployee() }}
              onCancel={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
