'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Award, MapPin, Calendar, Briefcase, Users } from 'lucide-react'
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
import type { EmployeeDetail, FixedSchedule, EmployeeStatus } from '@/lib/types'
import { EmployeeForm } from '@/components/employees/employee-form'
import { PromotionForm } from '@/components/employees/promotion-form'
import { employeeApi } from '@/lib/api/endpoints'

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

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPromotionOpen, setIsPromotionOpen] = useState(false)

  const fetchEmployee = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await employeeApi.getById(id)
      setEmployee(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được thông tin nhân viên')
      setEmployee(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

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
            <EmptyTitle>Không tìm thấy nhân viên</EmptyTitle>
            <EmptyDescription>Nhân viên bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</EmptyDescription>
          </EmptyHeader>
          <Button asChild className="mt-4"><Link href="/employees">Quay lại danh sách</Link></Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="size-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{employee.fullName}</h1>
            <p className="text-muted-foreground">{employee.department?.name || '-'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPromotionOpen(true)}><Award className="mr-2 size-4" />Thăng chức</Button>
          <Button onClick={() => setIsEditOpen(true)}><Pencil className="mr-2 size-4" />Chỉnh sửa</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Thông tin cơ bản</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Badge variant={employee.employmentStatus === 'ACTIVE' ? 'default' : 'secondary'}>{statusLabels[employee.employmentStatus]}</Badge>
            <Separator />
            <div className="text-sm"><MapPin className="mr-2 inline size-4 text-muted-foreground" />{employee.address}</div>
            <div className="text-sm"><Calendar className="mr-2 inline size-4 text-muted-foreground" />{new Date(employee.dob).toLocaleDateString('vi-VN')}</div>
            <div className="text-sm"><Briefcase className="mr-2 inline size-4 text-muted-foreground" />{employee.position?.name || '-'}</div>
            <div className="text-sm"><Award className="mr-2 inline size-4 text-muted-foreground" />{latestTitle || 'Chưa có'}</div>
            <div className="text-sm"><Calendar className="mr-2 inline size-4 text-muted-foreground" />{scheduleLabels[employee.fixedSchedule]}</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <Tabs defaultValue="projects" className="w-full">
            <CardHeader><TabsList><TabsTrigger value="projects">Dự án</TabsTrigger><TabsTrigger value="promotions">Lịch sử thăng chức</TabsTrigger></TabsList></CardHeader>
            <CardContent>
              <TabsContent value="projects" className="mt-0">
                {employee.projectMembers && employee.projectMembers.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow><TableHead>Dự án</TableHead><TableHead>Vai trò</TableHead><TableHead>Ngày tham gia</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {employee.projectMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell><Link href={`/projects/${member.projectId}`} className="font-medium hover:underline">{member.project?.name || member.projectId}</Link></TableCell>
                          <TableCell>{member.roleInProject || '-'}</TableCell>
                          <TableCell>{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('vi-VN') : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Empty><EmptyHeader><EmptyTitle>Chưa tham gia dự án nào</EmptyTitle></EmptyHeader></Empty>
                )}
              </TabsContent>

              <TabsContent value="promotions" className="mt-0">
                {employee.titleHistories && employee.titleHistories.length > 0 ? (
                  <div className="space-y-4">
                    {employee.titleHistories.map((promotion) => (
                      <div key={promotion.id} className="relative border-l-2 border-primary pb-6 pl-6 last:pb-0">
                        <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary" />
                        <p className="text-sm text-muted-foreground">{new Date(promotion.effectiveDate).toLocaleDateString('vi-VN')}</p>
                        <p className="font-medium">{promotion.oldJobTitle?.name ? `${promotion.oldJobTitle.name} → ${promotion.newJobTitle.name}` : `Bổ nhiệm: ${promotion.newJobTitle.name}`}</p>
                        {promotion.reason && <p className="text-sm text-muted-foreground">{promotion.reason}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty><EmptyHeader><EmptyTitle>Chưa có lịch sử thăng chức</EmptyTitle></EmptyHeader></Empty>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Chỉnh sửa nhân viên</DialogTitle></DialogHeader>
          <EmployeeForm employee={employee} onSuccess={() => { setIsEditOpen(false); void fetchEmployee() }} onCancel={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isPromotionOpen} onOpenChange={setIsPromotionOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Thăng chức nhân viên</DialogTitle></DialogHeader>
          <PromotionForm employeeId={employee.id} currentJobTitleName={latestTitle} onSuccess={() => { setIsPromotionOpen(false); void fetchEmployee() }} onCancel={() => setIsPromotionOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
