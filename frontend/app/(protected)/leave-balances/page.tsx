'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, CalendarDays, ClipboardList } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { LeaveBalance, LeaveTransaction } from '@/lib/types'
import { leaveApi } from '@/lib/api/endpoints'

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="ml-auto h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

export default function LeaveBalancesPage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBalance, setEditingBalance] = useState<LeaveBalance | null>(null)
  const [formEmployeeId, setFormEmployeeId] = useState('')
  const [formYear, setFormYear] = useState('')
  const [formAnnualLeave, setFormAnnualLeave] = useState('')
  const [formSickLeave, setFormSickLeave] = useState('')

  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null)
  const [transactions, setTransactions] = useState<LeaveTransaction[]>([])
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false)

  const fetchBalances = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await leaveApi.getAll({ size: 100 })
      setBalances(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách số ngày phép')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchBalances()
  }, [fetchBalances])

  const resetForm = () => {
    setFormEmployeeId('')
    setFormYear('')
    setFormAnnualLeave('')
    setFormSickLeave('')
  }

  const handleOpenCreate = () => {
    setEditingBalance(null)
    resetForm()
    setIsFormOpen(true)
  }

  const handleOpenEdit = (balance: LeaveBalance) => {
    setEditingBalance(balance)
    setFormEmployeeId(balance.employeeId)
    setFormYear(String(balance.year))
    setFormAnnualLeave(String(balance.annualLeave))
    setFormSickLeave(String(balance.sickLeave))
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formEmployeeId.trim()) {
      toast.error('Vui lòng nhập mã nhân viên')
      return
    }
    const yearNum = Number(formYear)
    if (!formYear.trim() || Number.isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      toast.error('Vui lòng nhập năm hợp lệ')
      return
    }
    const annualLeaveNum = Number(formAnnualLeave)
    if (formAnnualLeave.trim() && (Number.isNaN(annualLeaveNum) || annualLeaveNum < 0)) {
      toast.error('Phép năm không hợp lệ')
      return
    }
    const sickLeaveNum = Number(formSickLeave)
    if (formSickLeave.trim() && (Number.isNaN(sickLeaveNum) || sickLeaveNum < 0)) {
      toast.error('Phép bệnh không hợp lệ')
      return
    }

    try {
      if (editingBalance) {
        await leaveApi.update(editingBalance.id, {
          annualLeave: formAnnualLeave.trim() ? annualLeaveNum : undefined,
          sickLeave: formSickLeave.trim() ? sickLeaveNum : undefined,
        })
        toast.success('Cập nhật số ngày phép thành công')
      } else {
        await leaveApi.create({
          employeeId: formEmployeeId.trim(),
          year: yearNum,
          annualLeave: formAnnualLeave.trim() ? annualLeaveNum : undefined,
          sickLeave: formSickLeave.trim() ? sickLeaveNum : undefined,
        })
        toast.success('Thêm số ngày phép thành công')
      }
      setIsFormOpen(false)
      resetForm()
      await fetchBalances()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleRowClick = async (balance: LeaveBalance) => {
    setSelectedBalance(balance)
    setTransactionDialogOpen(true)
    setIsTransactionsLoading(true)
    try {
      const data = await leaveApi.getTransactions(balance.employeeId, { year: balance.year, size: 100 })
      setTransactions(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được lịch sử giao dịch')
      setTransactions([])
    } finally {
      setIsTransactionsLoading(false)
    }
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'OFF_FULL_DAY':
        return 'Nghỉ cả ngày'
      case 'OFF_AM':
        return 'Nghỉ buổi sáng'
      case 'OFF_PM':
        return 'Nghỉ buổi chiều'
      case 'REMOTE_FULL_DAY':
        return 'Làm việc từ xa cả ngày'
      case 'REMOTE_AM':
        return 'Làm việc từ xa buổi sáng'
      case 'REMOTE_PM':
        return 'Làm việc từ xa buổi chiều'
      case 'CHANGE_FIXED_SCHEDULE':
        return 'Thay đổi ca làm việc'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Số ngày phép</h1>
          <p className="text-muted-foreground">Quản lý số ngày phép của nhân viên trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm số ngày phép
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách số ngày phép</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : balances.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarDays className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có dữ liệu phép</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có số ngày phép nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm số ngày phép đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Năm</TableHead>
                  <TableHead>Phép năm</TableHead>
                  <TableHead>Phép bệnh</TableHead>
                  <TableHead>Nghỉ không lương</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((balance) => (
                  <TableRow
                    key={balance.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(balance)}
                  >
                    <TableCell className="font-medium">
                      {balance.employee?.fullName ?? balance.employeeId}
                    </TableCell>
                    <TableCell>{balance.year}</TableCell>
                    <TableCell>{balance.annualLeave}</TableCell>
                    <TableCell>{balance.sickLeave}</TableCell>
                    <TableCell>{balance.unpaidTaken}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEdit(balance)
                          }}
                        >
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBalance ? 'Chỉnh sửa số ngày phép' : 'Thêm số ngày phép mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="employee-id">Mã nhân viên</Label>
              <Input
                id="employee-id"
                placeholder="Nhập mã nhân viên..."
                value={formEmployeeId}
                onChange={(e) => setFormEmployeeId(e.target.value)}
                disabled={!!editingBalance}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Năm</Label>
              <Input
                id="year"
                placeholder="Nhập năm..."
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
                disabled={!!editingBalance}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual-leave">Phép năm (ngày)</Label>
              <Input
                id="annual-leave"
                placeholder="Nhập số ngày phép năm..."
                value={formAnnualLeave}
                onChange={(e) => setFormAnnualLeave(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sick-leave">Phép bệnh (ngày)</Label>
              <Input
                id="sick-leave"
                placeholder="Nhập số ngày phép bệnh..."
                value={formSickLeave}
                onChange={(e) => setFormSickLeave(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Hủy</Button>
              <Button onClick={handleSubmit}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch sử giao dịch phép</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {selectedBalance && (
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{selectedBalance.employee?.fullName ?? selectedBalance.employeeId}</Badge>
                <Badge variant="outline">Năm {selectedBalance.year}</Badge>
              </div>
            )}
            {isTransactionsLoading ? (
              <TransactionSkeleton />
            ) : transactions.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ClipboardList className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>Chưa có giao dịch</EmptyTitle>
                  <EmptyDescription>Nhân viên này chưa có giao dịch phép nào trong năm đã chọn.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại</TableHead>
                    <TableHead>Số ngày</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{getTransactionTypeLabel(tx.type)}</TableCell>
                      <TableCell>{tx.days}</TableCell>
                      <TableCell className="max-w-xs truncate">{tx.description ?? '-'}</TableCell>
                      <TableCell>{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
