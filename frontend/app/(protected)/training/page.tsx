'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, GraduationCap, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import type { TrainingPlan, TrainingRecord } from '@/lib/types'
import { trainingApi } from '@/lib/api/endpoints'

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

function formatDate(date?: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('vi-VN')
}

function isExpiringSoon(date?: string | null): boolean {
  if (!date) return false
  const expiry = new Date(date)
  const now = new Date()
  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return diffDays <= 30 && diffDays >= 0
}

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState('plans')

  // Plans state
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [planFormOpen, setPlanFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null)
  const [planTitle, setPlanTitle] = useState('')
  const [planProvider, setPlanProvider] = useState('')
  const [planStartDate, setPlanStartDate] = useState('')
  const [planEndDate, setPlanEndDate] = useState('')
  const [planCost, setPlanCost] = useState('')

  // Records state
  const [records, setRecords] = useState<TrainingRecord[]>([])
  const [recordsLoading, setRecordsLoading] = useState(true)
  const [recordFormOpen, setRecordFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<TrainingRecord | null>(null)
  const [recordEmployeeId, setRecordEmployeeId] = useState('')
  const [recordTrainingPlanId, setRecordTrainingPlanId] = useState('')
  const [recordCompletionDate, setRecordCompletionDate] = useState('')
  const [recordCertificateExpiry, setRecordCertificateExpiry] = useState('')
  const [recordScore, setRecordScore] = useState('')

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'plan' | 'record'>('plan')
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(null)

  // Expiring soon
  const [expiringSoon, setExpiringSoon] = useState<TrainingRecord[]>([])
  const [expiringLoading, setExpiringLoading] = useState(true)

  const fetchPlans = useCallback(async () => {
    setPlansLoading(true)
    try {
      const data = await trainingApi.getPlans({ size: 100 })
      setPlans(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách kế hoạch đào tạo')
    } finally {
      setPlansLoading(false)
    }
  }, [])

  const fetchRecords = useCallback(async () => {
    setRecordsLoading(true)
    try {
      const data = await trainingApi.getRecords({ size: 100 })
      setRecords(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách hồ sơ đào tạo')
    } finally {
      setRecordsLoading(false)
    }
  }, [])

  const fetchExpiringSoon = useCallback(async () => {
    setExpiringLoading(true)
    try {
      const data = await trainingApi.getExpiringSoon()
      setExpiringSoon(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách chứng chỉ sắp hết hạn')
    } finally {
      setExpiringLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPlans()
    void fetchRecords()
    void fetchExpiringSoon()
  }, [fetchPlans, fetchRecords, fetchExpiringSoon])

  const resetPlanForm = useCallback(() => {
    setPlanTitle('')
    setPlanProvider('')
    setPlanStartDate('')
    setPlanEndDate('')
    setPlanCost('')
    setEditingPlan(null)
  }, [])

  const resetRecordForm = useCallback(() => {
    setRecordEmployeeId('')
    setRecordTrainingPlanId('')
    setRecordCompletionDate('')
    setRecordCertificateExpiry('')
    setRecordScore('')
    setEditingRecord(null)
  }, [])

  const handleOpenCreatePlan = () => {
    resetPlanForm()
    setPlanFormOpen(true)
  }

  const handleOpenEditPlan = (plan: TrainingPlan) => {
    setEditingPlan(plan)
    setPlanTitle(plan.title)
    setPlanProvider(plan.provider || '')
    setPlanStartDate(plan.startDate ? plan.startDate.slice(0, 10) : '')
    setPlanEndDate(plan.endDate ? plan.endDate.slice(0, 10) : '')
    setPlanCost(plan.cost != null ? String(plan.cost) : '')
    setPlanFormOpen(true)
  }

  const handleSubmitPlan = async () => {
    if (!planTitle.trim()) {
      toast.error('Vui lòng nhập tên khóa học')
      return
    }
    if (!planStartDate || !planEndDate) {
      toast.error('Vui lòng nhập thởi gian khóa học')
      return
    }
    try {
      const payload = {
        title: planTitle.trim(),
        provider: planProvider.trim() || undefined,
        startDate: new Date(planStartDate).toISOString(),
        endDate: new Date(planEndDate).toISOString(),
        cost: planCost ? Number(planCost) : undefined,
      }
      if (editingPlan) {
        await trainingApi.updatePlan(editingPlan.id, payload)
        toast.success('Cập nhật kế hoạch đào tạo thành công')
      } else {
        await trainingApi.createPlan(payload)
        toast.success('Thêm kế hoạch đào tạo thành công')
      }
      setPlanFormOpen(false)
      resetPlanForm()
      await fetchPlans()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDeletePlan = (plan: TrainingPlan) => {
    setDeleteType('plan')
    setSelectedPlan(plan)
    setSelectedRecord(null)
    setDeleteDialogOpen(true)
  }

  const handleOpenCreateRecord = () => {
    resetRecordForm()
    setRecordFormOpen(true)
  }

  const handleOpenEditRecord = (record: TrainingRecord) => {
    setEditingRecord(record)
    setRecordEmployeeId(record.employeeId)
    setRecordTrainingPlanId(record.trainingPlanId)
    setRecordCompletionDate(record.completionDate ? record.completionDate.slice(0, 10) : '')
    setRecordCertificateExpiry(record.certificateExpiry ? record.certificateExpiry.slice(0, 10) : '')
    setRecordScore(record.score != null ? String(record.score) : '')
    setRecordFormOpen(true)
  }

  const handleSubmitRecord = async () => {
    if (!recordEmployeeId.trim()) {
      toast.error('Vui lòng nhập ID nhân viên')
      return
    }
    if (!recordTrainingPlanId.trim()) {
      toast.error('Vui lòng chọn khóa học')
      return
    }
    try {
      const payload = {
        employeeId: recordEmployeeId.trim(),
        trainingPlanId: recordTrainingPlanId.trim(),
        completionDate: recordCompletionDate ? new Date(recordCompletionDate).toISOString() : undefined,
        certificateExpiry: recordCertificateExpiry ? new Date(recordCertificateExpiry).toISOString() : undefined,
        score: recordScore ? Number(recordScore) : undefined,
      }
      if (editingRecord) {
        await trainingApi.updateRecord(editingRecord.id, payload)
        toast.success('Cập nhật hồ sơ đào tạo thành công')
      } else {
        await trainingApi.createRecord(payload)
        toast.success('Thêm hồ sơ đào tạo thành công')
      }
      setRecordFormOpen(false)
      resetRecordForm()
      await fetchRecords()
      await fetchExpiringSoon()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDeleteRecord = (record: TrainingRecord) => {
    setDeleteType('record')
    setSelectedRecord(record)
    setSelectedPlan(null)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (deleteType === 'plan' && selectedPlan) {
      try {
        await trainingApi.deletePlan(selectedPlan.id)
        toast.success('Đã xóa kế hoạch đào tạo')
        setDeleteDialogOpen(false)
        await fetchPlans()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể xóa kế hoạch đào tạo')
      }
    } else if (deleteType === 'record' && selectedRecord) {
      try {
        await trainingApi.deleteRecord(selectedRecord.id)
        toast.success('Đã xóa hồ sơ đào tạo')
        setDeleteDialogOpen(false)
        await fetchRecords()
        await fetchExpiringSoon()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể xóa hồ sơ đào tạo')
      }
    }
  }

  const planOptions = useMemo(() => {
    return plans.map((p) => ({ id: p.id, title: p.title }))
  }, [plans])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Đào tạo</h1>
          <p className="text-muted-foreground">Quản lý kế hoạch và hồ sơ đào tạo trong hệ thống</p>
        </div>
      </div>

      {expiringLoading ? (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardContent>
        </Card>
      ) : expiringSoon.length > 0 ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-destructive text-base">
              <AlertTriangle className="size-5" />
              Cảnh báo chứng chỉ sắp hết hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{rec.employee?.fullName || rec.employeeId}</span>
                    <span className="text-muted-foreground">-</span>
                    <span>{rec.trainingPlan?.title || rec.trainingPlanId}</span>
                  </div>
                  <Badge variant="destructive">
                    Hết hạn: {formatDate(rec.certificateExpiry)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">Kế hoạch đào tạo</TabsTrigger>
          <TabsTrigger value="records">Hồ sơ đào tạo</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Danh sách kế hoạch đào tạo</h2>
            <Button onClick={handleOpenCreatePlan}>
              <Plus className="mr-2 size-4" />
              Thêm kế hoạch
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {plansLoading ? (
                <TableSkeleton />
              ) : plans.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <GraduationCap className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Chưa có kế hoạch đào tạo</EmptyTitle>
                    <EmptyDescription>Hệ thống chưa có kế hoạch đào tạo nào.</EmptyDescription>
                  </EmptyHeader>
                  <Button onClick={handleOpenCreatePlan} className="mt-4">
                    <Plus className="mr-2 size-4" />
                    Thêm kế hoạch đầu tiên
                  </Button>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên khóa học</TableHead>
                      <TableHead>Nhà cung cấp</TableHead>
                      <TableHead>Thởi gian</TableHead>
                      <TableHead>Chi phí</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.title}</TableCell>
                        <TableCell>{plan.provider || '-'}</TableCell>
                        <TableCell>
                          {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                        </TableCell>
                        <TableCell>
                          {plan.cost != null
                            ? plan.cost.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditPlan(plan)}>
                              <Pencil className="size-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDeletePlan(plan)}>
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

        <TabsContent value="records" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Danh sách hồ sơ đào tạo</h2>
            <Button onClick={handleOpenCreateRecord}>
              <Plus className="mr-2 size-4" />
              Thêm hồ sơ
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {recordsLoading ? (
                <TableSkeleton />
              ) : records.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <GraduationCap className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Chưa có hồ sơ đào tạo</EmptyTitle>
                    <EmptyDescription>Hệ thống chưa có hồ sơ đào tạo nào.</EmptyDescription>
                  </EmptyHeader>
                  <Button onClick={handleOpenCreateRecord} className="mt-4">
                    <Plus className="mr-2 size-4" />
                    Thêm hồ sơ đầu tiên
                  </Button>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Khóa học</TableHead>
                      <TableHead>Ngày hoàn thành</TableHead>
                      <TableHead>Chứng chỉ hết hạn</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((rec) => (
                      <TableRow key={rec.id}>
                        <TableCell className="font-medium">{rec.employee?.fullName || rec.employeeId}</TableCell>
                        <TableCell>{rec.trainingPlan?.title || rec.trainingPlanId}</TableCell>
                        <TableCell>{formatDate(rec.completionDate)}</TableCell>
                        <TableCell>
                          {rec.certificateExpiry ? (
                            <div className="flex items-center gap-2">
                              <span>{formatDate(rec.certificateExpiry)}</span>
                              {isExpiringSoon(rec.certificateExpiry) && (
                                <Badge variant="destructive">Sắp hết hạn</Badge>
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditRecord(rec)}>
                              <Pencil className="size-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteRecord(rec)}>
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
      </Tabs>

      {/* Plan Form Dialog */}
      <Dialog open={planFormOpen} onOpenChange={setPlanFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Chỉnh sửa kế hoạch đào tạo' : 'Thêm kế hoạch đào tạo mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="plan-title">Tên khóa học</Label>
              <Input
                id="plan-title"
                placeholder="Nhập tên khóa học..."
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-provider">Nhà cung cấp</Label>
              <Input
                id="plan-provider"
                placeholder="Nhập nhà cung cấp..."
                value={planProvider}
                onChange={(e) => setPlanProvider(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="plan-start">Ngày bắt đầu</Label>
                <Input
                  id="plan-start"
                  type="date"
                  value={planStartDate}
                  onChange={(e) => setPlanStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-end">Ngày kết thúc</Label>
                <Input
                  id="plan-end"
                  type="date"
                  value={planEndDate}
                  onChange={(e) => setPlanEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-cost">Chi phí (VND)</Label>
              <Input
                id="plan-cost"
                type="number"
                placeholder="Nhập chi phí..."
                value={planCost}
                onChange={(e) => setPlanCost(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setPlanFormOpen(false); resetPlanForm() }}>Hủy</Button>
              <Button onClick={handleSubmitPlan}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Form Dialog */}
      <Dialog open={recordFormOpen} onOpenChange={setRecordFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Chỉnh sửa hồ sơ đào tạo' : 'Thêm hồ sơ đào tạo mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="record-employee">ID Nhân viên</Label>
              <Input
                id="record-employee"
                placeholder="Nhập ID nhân viên..."
                value={recordEmployeeId}
                onChange={(e) => setRecordEmployeeId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="record-plan">Khóa học</Label>
              <select
                id="record-plan"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={recordTrainingPlanId}
                onChange={(e) => setRecordTrainingPlanId(e.target.value)}
              >
                <option value="">Chọn khóa học...</option>
                {planOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="record-completion">Ngày hoàn thành</Label>
                <Input
                  id="record-completion"
                  type="date"
                  value={recordCompletionDate}
                  onChange={(e) => setRecordCompletionDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="record-expiry">Hết hạn chứng chỉ</Label>
                <Input
                  id="record-expiry"
                  type="date"
                  value={recordCertificateExpiry}
                  onChange={(e) => setRecordCertificateExpiry(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="record-score">Điểm số</Label>
              <Input
                id="record-score"
                type="number"
                placeholder="Nhập điểm số..."
                value={recordScore}
                onChange={(e) => setRecordScore(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRecordFormOpen(false); resetRecordForm() }}>Hủy</Button>
              <Button onClick={handleSubmitRecord}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'plan' ? (
                <>Bạn có chắc chắn muốn xóa kế hoạch đào tạo <strong>{selectedPlan?.title}</strong>? Hành động này không thể hoàn tác.</>
              ) : (
                <>Bạn có chắc chắn muốn xóa hồ sơ đào tạo của nhân viên <strong>{selectedRecord?.employee?.fullName || selectedRecord?.employeeId}</strong>? Hành động này không thể hoàn tác.</>
              )}
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
