'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Calculator, CheckCircle, Banknote, Receipt } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import type { Payroll, PayrollItem, SalaryStructure } from '@/lib/types'
import { payrollApi } from '@/lib/api/endpoints'

function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="ml-auto h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="secondary">Bản nháp</Badge>
    case 'PENDING':
      return <Badge className="bg-amber-500 text-white hover:bg-amber-500/90">Chờ duyệt</Badge>
    case 'APPROVED':
      return <Badge variant="default">Đã duyệt</Badge>
    case 'PAID':
      return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">Đã chi trả</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function PayrollsPage() {
  const [activeTab, setActiveTab] = useState('payrolls')

  // Payrolls state
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [payrollsLoading, setPayrollsLoading] = useState(true)
  const [isPayrollFormOpen, setIsPayrollFormOpen] = useState(false)
  const [payrollMonth, setPayrollMonth] = useState('')
  const [payrollYear, setPayrollYear] = useState('')

  // Payroll items dialog
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false)
  const [editingItems, setEditingItems] = useState<Record<string, { bonus: string; deductions: string; notes: string }>>({})

  // Salary structures state
  const [structures, setStructures] = useState<SalaryStructure[]>([])
  const [structuresLoading, setStructuresLoading] = useState(true)
  const [isStructureFormOpen, setIsStructureFormOpen] = useState(false)
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null)
  const [structureForm, setStructureForm] = useState({
    employeeId: '',
    baseSalary: '',
    allowance: '',
    bonus: '',
    effectiveFrom: '',
  })
  const [deleteStructureDialogOpen, setDeleteStructureDialogOpen] = useState(false)
  const [selectedStructure, setSelectedStructure] = useState<SalaryStructure | null>(null)

  const fetchPayrolls = useCallback(async () => {
    setPayrollsLoading(true)
    try {
      const data = await payrollApi.getPayrolls({ size: 100 })
      setPayrolls(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách bảng lương')
    } finally {
      setPayrollsLoading(false)
    }
  }, [])

  const fetchStructures = useCallback(async () => {
    setStructuresLoading(true)
    try {
      const data = await payrollApi.getSalaryStructures({ size: 100 })
      setStructures(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách cơ cấu lương')
    } finally {
      setStructuresLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPayrolls()
    void fetchStructures()
  }, [fetchPayrolls, fetchStructures])

  const handleCreatePayroll = async () => {
    const month = parseInt(payrollMonth, 10)
    const year = parseInt(payrollYear, 10)
    if (!month || month < 1 || month > 12) {
      toast.error('Vui lòng nhập tháng hợp lệ (1-12)')
      return
    }
    if (!year || year < 2000 || year > 2100) {
      toast.error('Vui lòng nhập năm hợp lệ')
      return
    }
    try {
      await payrollApi.createPayroll({ month, year })
      toast.success('Tạo bảng lương thành công')
      setIsPayrollFormOpen(false)
      setPayrollMonth('')
      setPayrollYear('')
      await fetchPayrolls()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Tạo bảng lương thất bại')
    }
  }

  const handleCalculatePayroll = async (payroll: Payroll) => {
    try {
      await payrollApi.calculatePayroll(payroll.id)
      toast.success('Tính lương thành công')
      await fetchPayrolls()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Tính lương thất bại')
    }
  }

  const handleApprovePayroll = async (payroll: Payroll) => {
    try {
      await payrollApi.approvePayroll(payroll.id)
      toast.success('Duyệt bảng lương thành công')
      await fetchPayrolls()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Duyệt bảng lương thất bại')
    }
  }

  const handlePayPayroll = async (payroll: Payroll) => {
    try {
      await payrollApi.payPayroll(payroll.id)
      toast.success('Chi trả lương thành công')
      await fetchPayrolls()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chi trả lương thất bại')
    }
  }

  const handleOpenItems = async (payroll: Payroll) => {
    setSelectedPayroll(payroll)
    setItemsDialogOpen(true)
    setItemsLoading(true)
    try {
      const data = await payrollApi.getPayroll(payroll.id)
      const items = data.items || []
      setPayrollItems(items)
      const edits: Record<string, { bonus: string; deductions: string; notes: string }> = {}
      items.forEach((item) => {
        edits[item.id] = {
          bonus: String(item.bonus ?? 0),
          deductions: String(item.deductions ?? 0),
          notes: item.notes ?? '',
        }
      })
      setEditingItems(edits)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được chi tiết bảng lương')
    } finally {
      setItemsLoading(false)
    }
  }

  const handleUpdatePayrollItem = async (itemId: string) => {
    if (!selectedPayroll) return
    const edit = editingItems[itemId]
    if (!edit) return
    try {
      await payrollApi.updatePayrollItem(selectedPayroll.id, itemId, {
        bonus: parseFloat(edit.bonus) || 0,
        deductions: parseFloat(edit.deductions) || 0,
        notes: edit.notes,
      })
      toast.success('Cập nhật thành công')
      const data = await payrollApi.getPayroll(selectedPayroll.id)
      setPayrollItems(data.items || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cập nhật thất bại')
    }
  }

  const handleOpenCreateStructure = () => {
    setEditingStructure(null)
    setStructureForm({ employeeId: '', baseSalary: '', allowance: '', bonus: '', effectiveFrom: '' })
    setIsStructureFormOpen(true)
  }

  const handleOpenEditStructure = (structure: SalaryStructure) => {
    setEditingStructure(structure)
    setStructureForm({
      employeeId: structure.employeeId,
      baseSalary: String(structure.baseSalary),
      allowance: String(structure.allowance),
      bonus: String(structure.bonus),
      effectiveFrom: structure.effectiveFrom.slice(0, 10),
    })
    setIsStructureFormOpen(true)
  }

  const handleSubmitStructure = async () => {
    if (!structureForm.employeeId.trim()) {
      toast.error('Vui lòng nhập mã nhân viên')
      return
    }
    const baseSalary = parseFloat(structureForm.baseSalary)
    if (isNaN(baseSalary) || baseSalary < 0) {
      toast.error('Lương cơ bản không hợp lệ')
      return
    }
    const payload: Partial<SalaryStructure> = {
      employeeId: structureForm.employeeId.trim(),
      baseSalary,
      allowance: parseFloat(structureForm.allowance) || 0,
      bonus: parseFloat(structureForm.bonus) || 0,
      effectiveFrom: new Date(structureForm.effectiveFrom).toISOString(),
    }
    try {
      if (editingStructure) {
        await payrollApi.updateSalaryStructure(editingStructure.id, payload)
        toast.success('Cập nhật cơ cấu lương thành công')
      } else {
        await payrollApi.createSalaryStructure(payload)
        toast.success('Thêm cơ cấu lương thành công')
      }
      setIsStructureFormOpen(false)
      await fetchStructures()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDeleteStructure = (structure: SalaryStructure) => {
    setSelectedStructure(structure)
    setDeleteStructureDialogOpen(true)
  }

  const handleDeleteStructure = async () => {
    if (!selectedStructure) return
    try {
      await payrollApi.deleteSalaryStructure(selectedStructure.id)
      toast.success('Đã xóa cơ cấu lương')
      setDeleteStructureDialogOpen(false)
      await fetchStructures()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa cơ cấu lương')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lương</h1>
          <p className="text-muted-foreground">Quản lý bảng lương và cơ cấu lương trong hệ thống</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="payrolls">Bảng lương</TabsTrigger>
          <TabsTrigger value="structures">Cơ cấu lương</TabsTrigger>
        </TabsList>

        <TabsContent value="payrolls" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Danh sách bảng lương</CardTitle>
              <Button onClick={() => setIsPayrollFormOpen(true)}>
                <Plus className="mr-2 size-4" />
                Tạo bảng lương
              </Button>
            </CardHeader>
            <CardContent>
              {payrollsLoading ? (
                <TableSkeleton />
              ) : payrolls.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Receipt className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Chưa có bảng lương</EmptyTitle>
                    <EmptyDescription>Hệ thống chưa có bảng lương nào.</EmptyDescription>
                  </EmptyHeader>
                  <Button onClick={() => setIsPayrollFormOpen(true)} className="mt-4">
                    <Plus className="mr-2 size-4" />
                    Tạo bảng lương đầu tiên
                  </Button>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tháng/Năm</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Số nhân viên</TableHead>
                      <TableHead className="w-48"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrolls.map((payroll) => (
                      <TableRow
                        key={payroll.id}
                        className="cursor-pointer"
                        onClick={() => handleOpenItems(payroll)}
                      >
                        <TableCell className="font-medium">
                          {payroll.month}/{payroll.year}
                        </TableCell>
                        <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                        <TableCell>{payroll._count?.items ?? 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {payroll.status === 'DRAFT' && (
                              <Button variant="ghost" size="icon" onClick={() => handleCalculatePayroll(payroll)}>
                                <Calculator className="size-4" />
                                <span className="sr-only">Tính lương</span>
                              </Button>
                            )}
                            {(payroll.status === 'DRAFT' || payroll.status === 'PENDING') && (
                              <Button variant="ghost" size="icon" onClick={() => handleApprovePayroll(payroll)}>
                                <CheckCircle className="size-4" />
                                <span className="sr-only">Duyệt</span>
                              </Button>
                            )}
                            {payroll.status === 'APPROVED' && (
                              <Button variant="ghost" size="icon" onClick={() => handlePayPayroll(payroll)}>
                                <Banknote className="size-4" />
                                <span className="sr-only">Chi trả</span>
                              </Button>
                            )}
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

        <TabsContent value="structures" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Danh sách cơ cấu lương</CardTitle>
              <Button onClick={handleOpenCreateStructure}>
                <Plus className="mr-2 size-4" />
                Thêm cơ cấu lương
              </Button>
            </CardHeader>
            <CardContent>
              {structuresLoading ? (
                <TableSkeleton />
              ) : structures.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Receipt className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Chưa có cơ cấu lương</EmptyTitle>
                    <EmptyDescription>Hệ thống chưa có cơ cấu lương nào.</EmptyDescription>
                  </EmptyHeader>
                  <Button onClick={handleOpenCreateStructure} className="mt-4">
                    <Plus className="mr-2 size-4" />
                    Thêm cơ cấu lương đầu tiên
                  </Button>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Lương cơ bản</TableHead>
                      <TableHead>Phụ cấp</TableHead>
                      <TableHead>Hiệu lực từ</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {structures.map((structure) => (
                      <TableRow key={structure.id}>
                        <TableCell className="font-medium">
                          {structure.employee?.fullName ?? structure.employeeId}
                        </TableCell>
                        <TableCell>{formatCurrency(structure.baseSalary)}</TableCell>
                        <TableCell>{formatCurrency(structure.allowance)}</TableCell>
                        <TableCell>{new Date(structure.effectiveFrom).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditStructure(structure)}>
                              <Pencil className="size-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteStructure(structure)}>
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

      {/* Create Payroll Dialog */}
      <Dialog open={isPayrollFormOpen} onOpenChange={setIsPayrollFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo bảng lương mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="payroll-month">Tháng</Label>
              <Input
                id="payroll-month"
                type="number"
                min={1}
                max={12}
                placeholder="Nhập tháng (1-12)..."
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payroll-year">Năm</Label>
              <Input
                id="payroll-year"
                type="number"
                placeholder="Nhập năm..."
                value={payrollYear}
                onChange={(e) => setPayrollYear(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPayrollFormOpen(false)}>Hủy</Button>
              <Button onClick={handleCreatePayroll}>Tạo</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payroll Items Dialog */}
      <Dialog open={itemsDialogOpen} onOpenChange={setItemsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Chi tiết bảng lương tháng {selectedPayroll?.month}/{selectedPayroll?.year}
            </DialogTitle>
          </DialogHeader>
          {itemsLoading ? (
            <TableSkeleton rows={5} />
          ) : payrollItems.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Chưa có dữ liệu</EmptyTitle>
                <EmptyDescription>Bảng lương chưa có chi tiết nhân viên nào.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Lương cơ bản</TableHead>
                  <TableHead>Phụ cấp</TableHead>
                  <TableHead>Thưởng</TableHead>
                  <TableHead>Khấu trừ</TableHead>
                  <TableHead>Thuế</TableHead>
                  <TableHead>Thực lĩnh</TableHead>
                  {selectedPayroll?.status === 'DRAFT' && <TableHead className="w-24"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.employee?.fullName ?? item.employeeId}
                    </TableCell>
                    <TableCell>{formatCurrency(item.baseSalary)}</TableCell>
                    <TableCell>{formatCurrency(item.allowance)}</TableCell>
                    <TableCell>
                      {selectedPayroll?.status === 'DRAFT' ? (
                        <Input
                          type="number"
                          className="w-28"
                          value={editingItems[item.id]?.bonus ?? String(item.bonus ?? 0)}
                          onChange={(e) =>
                            setEditingItems((prev) => ({
                              ...prev,
                              [item.id]: { ...(prev[item.id] || { bonus: '', deductions: '', notes: '' }), bonus: e.target.value },
                            }))
                          }
                        />
                      ) : (
                        formatCurrency(item.bonus)
                      )}
                    </TableCell>
                    <TableCell>
                      {selectedPayroll?.status === 'DRAFT' ? (
                        <Input
                          type="number"
                          className="w-28"
                          value={editingItems[item.id]?.deductions ?? String(item.deductions ?? 0)}
                          onChange={(e) =>
                            setEditingItems((prev) => ({
                              ...prev,
                              [item.id]: { ...(prev[item.id] || { bonus: '', deductions: '', notes: '' }), deductions: e.target.value },
                            }))
                          }
                        />
                      ) : (
                        formatCurrency(item.deductions)
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(item.tax)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(item.netPay)}</TableCell>
                    {selectedPayroll?.status === 'DRAFT' && (
                      <TableCell>
                        <Button size="sm" onClick={() => handleUpdatePayrollItem(item.id)}>Lưu</Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {selectedPayroll?.status === 'DRAFT' && payrollItems.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Ghi chú: Chỉnh sửa Thưởng và Khấu trừ, sau đó nhấn Lưu để cập nhật từng dòng.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Salary Structure Form Dialog */}
      <Dialog open={isStructureFormOpen} onOpenChange={setIsStructureFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStructure ? 'Chỉnh sửa cơ cấu lương' : 'Thêm cơ cấu lương mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="structure-employee">Mã nhân viên</Label>
              <Input
                id="structure-employee"
                placeholder="Nhập mã nhân viên..."
                value={structureForm.employeeId}
                onChange={(e) => setStructureForm((prev) => ({ ...prev, employeeId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure-base">Lương cơ bản</Label>
              <Input
                id="structure-base"
                type="number"
                placeholder="Nhập lương cơ bản..."
                value={structureForm.baseSalary}
                onChange={(e) => setStructureForm((prev) => ({ ...prev, baseSalary: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure-allowance">Phụ cấp</Label>
              <Input
                id="structure-allowance"
                type="number"
                placeholder="Nhập phụ cấp..."
                value={structureForm.allowance}
                onChange={(e) => setStructureForm((prev) => ({ ...prev, allowance: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure-bonus">Thưởng</Label>
              <Input
                id="structure-bonus"
                type="number"
                placeholder="Nhập thưởng..."
                value={structureForm.bonus}
                onChange={(e) => setStructureForm((prev) => ({ ...prev, bonus: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure-effective">Hiệu lực từ</Label>
              <Input
                id="structure-effective"
                type="date"
                value={structureForm.effectiveFrom}
                onChange={(e) => setStructureForm((prev) => ({ ...prev, effectiveFrom: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsStructureFormOpen(false)}>Hủy</Button>
              <Button onClick={handleSubmitStructure}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Structure Alert Dialog */}
      <AlertDialog open={deleteStructureDialogOpen} onOpenChange={setDeleteStructureDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cơ cấu lương của nhân viên{' '}
              <strong>{selectedStructure?.employee?.fullName ?? selectedStructure?.employeeId}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStructure} className="bg-destructive text-white hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
