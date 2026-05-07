'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Send, CheckCircle, FileText, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { Invoice, InvoiceItem, InvoiceStatus } from '@/lib/types'
import { invoiceApi } from '@/lib/api/endpoints'

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

const statusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'Bản nháp',
  SENT: 'Đã gửi',
  PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn',
}

const statusBadgeVariant: Record<InvoiceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  SENT: 'default',
  PAID: 'outline',
  OVERDUE: 'destructive',
}

interface InvoiceFormItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [formCustomerId, setFormCustomerId] = useState('')
  const [formProjectId, setFormProjectId] = useState('')
  const [formInvoiceDate, setFormInvoiceDate] = useState('')
  const [formDueDate, setFormDueDate] = useState('')
  const [formItems, setFormItems] = useState<InvoiceFormItem[]>([])

  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)

  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [genProjectId, setGenProjectId] = useState('')
  const [genMonth, setGenMonth] = useState('')
  const [genYear, setGenYear] = useState('')

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: { status?: string; size: number } = { size: 100 }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter
      }
      const data = await invoiceApi.getAll(params)
      setInvoices(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách hóa đơn')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    void fetchInvoices()
  }, [fetchInvoices])

  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'ALL') return invoices
    return invoices.filter((inv) => inv.status === statusFilter)
  }, [invoices, statusFilter])

  const resetForm = () => {
    setFormCustomerId('')
    setFormProjectId('')
    setFormInvoiceDate('')
    setFormDueDate('')
    setFormItems([])
    setEditingInvoice(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const handleOpenEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setFormCustomerId(invoice.customerId)
    setFormProjectId(invoice.projectId)
    setFormInvoiceDate(invoice.invoiceDate ? invoice.invoiceDate.slice(0, 10) : '')
    setFormDueDate(invoice.dueDate ? invoice.dueDate.slice(0, 10) : '')
    setFormItems(
      (invoice.items ?? []).map((it) => ({
        id: generateId(),
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      }))
    )
    setIsFormOpen(true)
  }

  const handleAddItem = () => {
    setFormItems((prev) => [
      ...prev,
      { id: generateId(), description: '', quantity: 1, unitPrice: 0 },
    ])
  }

  const handleRemoveItem = (id: string) => {
    setFormItems((prev) => prev.filter((it) => it.id !== id))
  }

  const handleUpdateItem = (id: string, field: keyof InvoiceFormItem, value: string | number) => {
    setFormItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    )
  }

  const calculateTotal = (items: InvoiceFormItem[]) => {
    return items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)
  }

  const handleSubmit = async () => {
    if (!formCustomerId.trim() || !formProjectId.trim() || !formInvoiceDate || !formDueDate) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    if (formItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất một mục')
      return
    }
    for (const it of formItems) {
      if (!it.description.trim()) {
        toast.error('Vui lòng nhập mô tả cho tất cả các mục')
        return
      }
    }

    const payload = {
      customerId: formCustomerId.trim(),
      projectId: formProjectId.trim(),
      invoiceDate: formInvoiceDate,
      dueDate: formDueDate,
      items: formItems.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
      })),
    }

    try {
      if (editingInvoice) {
        await invoiceApi.update(editingInvoice.id, payload)
        toast.success('Cập nhật hóa đơn thành công')
      } else {
        await invoiceApi.create(payload)
        toast.success('Tạo hóa đơn thành công')
      }
      setIsFormOpen(false)
      resetForm()
      await fetchInvoices()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleSend = async (invoice: Invoice) => {
    try {
      await invoiceApi.send(invoice.id)
      toast.success('Đã gửi hóa đơn')
      await fetchInvoices()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi hóa đơn')
    }
  }

  const handlePay = async (invoice: Invoice) => {
    try {
      await invoiceApi.pay(invoice.id)
      toast.success('Đã đánh dấu thanh toán')
      await fetchInvoices()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái')
    }
  }

  const handleOpenDelete = (invoice: Invoice) => {
    setInvoiceToDelete(invoice)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!invoiceToDelete) return
    try {
      await invoiceApi.delete(invoiceToDelete.id)
      toast.success('Đã xóa hóa đơn')
      setDeleteDialogOpen(false)
      await fetchInvoices()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa hóa đơn')
    }
  }

  const handleOpenDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDetailDialogOpen(true)
  }

  const handleGenerateFromRevenue = async () => {
    if (!genProjectId.trim() || !genMonth.trim() || !genYear.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    try {
      await invoiceApi.generateFromRevenue({
        projectId: genProjectId.trim(),
        month: Number(genMonth),
        year: Number(genYear),
      })
      toast.success('Tạo hóa đơn từ doanh thu thành công')
      setGenerateDialogOpen(false)
      setGenProjectId('')
      setGenMonth('')
      setGenYear('')
      await fetchInvoices()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo hóa đơn từ doanh thu')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hóa đơn</h1>
          <p className="text-muted-foreground">Quản lý hóa đơn và trạng thái thanh toán</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setGenerateDialogOpen(true)}>
            <Receipt className="mr-2 size-4" />
            Tạo từ doanh thu
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 size-4" />
            Tạo hóa đơn
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Danh sách hóa đơn</CardTitle>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as InvoiceStatus | 'ALL')}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
              <SelectItem value="SENT">Đã gửi</SelectItem>
              <SelectItem value="PAID">Đã thanh toán</SelectItem>
              <SelectItem value="OVERDUE">Quá hạn</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : filteredInvoices.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có hóa đơn</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có hóa đơn nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Tạo hóa đơn đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã hóa đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Dự án</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đến hạn</TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow
                    key={inv.id}
                    className="cursor-pointer"
                    onClick={() => handleOpenDetail(inv)}
                  >
                    <TableCell className="font-medium">{inv.id.slice(0, 8)}</TableCell>
                    <TableCell>{inv.customer?.companyName ?? inv.customerId}</TableCell>
                    <TableCell>{inv.project?.name ?? inv.projectId}</TableCell>
                    <TableCell>
                      {inv.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[inv.status]}>
                        {statusLabels[inv.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(inv.dueDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {inv.status === 'DRAFT' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleSend(inv)}>
                              <Send className="size-4" />
                              <span className="sr-only">Gửi</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(inv)}>
                              <Pencil className="size-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(inv)}>
                              <Trash2 className="size-4 text-destructive" />
                              <span className="sr-only">Xóa</span>
                            </Button>
                          </>
                        )}
                        {inv.status === 'SENT' && (
                          <Button variant="ghost" size="icon" onClick={() => handlePay(inv)}>
                            <CheckCircle className="size-4" />
                            <span className="sr-only">Đánh dấu đã thanh toán</span>
                          </Button>
                        )}
                        {inv.status === 'PAID' && <span className="text-muted-foreground text-sm">—</span>}
                        {inv.status === 'OVERDUE' && (
                          <Button variant="ghost" size="icon" onClick={() => handlePay(inv)}>
                            <CheckCircle className="size-4" />
                            <span className="sr-only">Đánh dấu đã thanh toán</span>
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

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? 'Chỉnh sửa hóa đơn' : 'Tạo hóa đơn mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerId">Mã khách hàng</Label>
                <Input
                  id="customerId"
                  placeholder="Nhập mã khách hàng..."
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectId">Mã dự án</Label>
                <Input
                  id="projectId"
                  placeholder="Nhập mã dự án..."
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Ngày lập hóa đơn</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formInvoiceDate}
                  onChange={(e) => setFormInvoiceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Ngày đến hạn</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chi tiết hóa đơn</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="mr-1 size-3" />
                  Thêm mục
                </Button>
              </div>
              {formItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">Chưa có mục nào.</p>
              ) : (
                <div className="space-y-2">
                  {formItems.map((it) => (
                    <div key={it.id} className="flex items-end gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Mô tả"
                          value={it.description}
                          onChange={(e) => handleUpdateItem(it.id, 'description', e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min={1}
                          placeholder="SL"
                          value={it.quantity}
                          onChange={(e) => handleUpdateItem(it.id, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Đơn giá"
                          value={it.unitPrice}
                          onChange={(e) => handleUpdateItem(it.id, 'unitPrice', Number(e.target.value))}
                        />
                      </div>
                      <div className="w-28 text-right text-sm">
                        {(it.quantity * it.unitPrice).toLocaleString('vi-VN')}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(it.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-end text-sm font-medium">
                    Tổng cộng: {calculateTotal(formItems).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsFormOpen(false); resetForm() }}>
                Hủy
              </Button>
              <Button onClick={handleSubmit}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Mã hóa đơn</div>
                <div className="font-medium">{selectedInvoice.id}</div>
                <div className="text-muted-foreground">Khách hàng</div>
                <div className="font-medium">{selectedInvoice.customer?.companyName ?? selectedInvoice.customerId}</div>
                <div className="text-muted-foreground">Dự án</div>
                <div className="font-medium">{selectedInvoice.project?.name ?? selectedInvoice.projectId}</div>
                <div className="text-muted-foreground">Ngày lập</div>
                <div className="font-medium">{new Date(selectedInvoice.invoiceDate).toLocaleDateString('vi-VN')}</div>
                <div className="text-muted-foreground">Ngày đến hạn</div>
                <div className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString('vi-VN')}</div>
                <div className="text-muted-foreground">Trạng thái</div>
                <div>
                  <Badge variant={statusBadgeVariant[selectedInvoice.status]}>
                    {statusLabels[selectedInvoice.status]}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Chi tiết mục</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mô tả</TableHead>
                      <TableHead className="text-right">SL</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedInvoice.items ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Không có chi tiết
                        </TableCell>
                      </TableRow>
                    ) : (
                      (selectedInvoice.items ?? []).map((it: InvoiceItem) => (
                        <TableRow key={it.id}>
                          <TableCell>{it.description}</TableCell>
                          <TableCell className="text-right">{it.quantity}</TableCell>
                          <TableCell className="text-right">
                            {it.unitPrice.toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell className="text-right">
                            {(it.quantity * it.unitPrice).toLocaleString('vi-VN')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-end text-sm font-medium">
                  Tổng tiền: {selectedInvoice.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hóa đơn{' '}
              <strong>{invoiceToDelete?.id.slice(0, 8)}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate from Revenue Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo hóa đơn từ doanh thu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="genProjectId">Mã dự án</Label>
              <Input
                id="genProjectId"
                placeholder="Nhập mã dự án..."
                value={genProjectId}
                onChange={(e) => setGenProjectId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genMonth">Tháng</Label>
                <Input
                  id="genMonth"
                  type="number"
                  min={1}
                  max={12}
                  placeholder="1-12"
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genYear">Năm</Label>
                <Input
                  id="genYear"
                  type="number"
                  min={2000}
                  placeholder="YYYY"
                  value={genYear}
                  onChange={(e) => setGenYear(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setGenerateDialogOpen(false); setGenProjectId(''); setGenMonth(''); setGenYear('') }}>
                Hủy
              </Button>
              <Button onClick={handleGenerateFromRevenue}>Tạo</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
