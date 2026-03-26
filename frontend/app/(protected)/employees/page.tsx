'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Eye, Pencil, UserX, Users } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { ListPagination } from '@/components/ui/list-pagination'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Employee, EmployeeStatus, FixedSchedule } from '@/lib/types'
import { EmployeeForm } from '@/components/employees/employee-form'
import { employeeApi } from '@/lib/api/endpoints'
import { getEmployeeProfileMock } from '@/lib/employee-profile-mock'

const statusLabels: Record<EmployeeStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
}

const scheduleLabels: Record<FixedSchedule, string> = {
  SHIFT_8_5: '8:00 - 17:00',
  SHIFT_9_6: '9:00 - 18:00',
}

function EmployeeTableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await employeeApi.getAll({
        keyword: searchKeyword || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        size,
      })
      setEmployees(data.items)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách nhân viên')
    } finally {
      setIsLoading(false)
    }
  }, [searchKeyword, statusFilter, page, size])

  useEffect(() => {
    void fetchEmployees()
  }, [fetchEmployees])

  const filteredEmployees = useMemo(() => employees, [employees])

  useEffect(() => {
    setPage(1)
  }, [searchKeyword, statusFilter])

  const handleDelete = async () => {
    if (!selectedEmployee) return

    try {
      await employeeApi.delete(selectedEmployee.id)
      toast.success('Đã ngừng sử dụng nhân viên thành công')
      setDeleteDialogOpen(false)
      setSelectedEmployee(null)
      await fetchEmployees()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể ngừng sử dụng nhân viên')
    }
  }

  const handleOpenDelete = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDeleteDialogOpen(true)
  }

  const handleOpenEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsFormOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingEmployee(null)
    setIsFormOpen(true)
  }

  const handleFormSuccess = async () => {
    setIsFormOpen(false)
    setEditingEmployee(null)
    toast.success(editingEmployee ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên thành công')
    await fetchEmployees()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nhân viên</h1>
          <p className="text-muted-foreground">Quản lý danh sách nhân viên trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm nhân viên
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <EmployeeTableSkeleton />
          ) : filteredEmployees.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Không có nhân viên</EmptyTitle>
                <EmptyDescription>
                  {searchKeyword || statusFilter !== 'all'
                    ? 'Không tìm thấy nhân viên phù hợp với bộ lọc'
                    : 'Chưa có nhân viên nào trong hệ thống'}
                </EmptyDescription>
              </EmptyHeader>
              {!searchKeyword && statusFilter === 'all' && (
                <Button onClick={handleOpenCreate} className="mt-4">
                  <Plus className="mr-2 size-4" />
                  Thêm nhân viên đầu tiên
                </Button>
              )}
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Ca làm việc</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => {
                    const profile = getEmployeeProfileMock({
                      id: employee.id,
                      fullName: employee.fullName,
                      address: employee.address,
                    })

                    return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage src={profile.avatarUrl} />
                              <AvatarFallback>{profile.initials}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{employee.fullName}</div>
                          </div>
                        </TableCell>
                      <TableCell>{employee.department?.name || '-'}</TableCell>
                      <TableCell>{employee.position?.name || '-'}</TableCell>
                      <TableCell>{scheduleLabels[employee.fixedSchedule]}</TableCell>
                      <TableCell>
                        <Badge variant={employee.employmentStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                          {statusLabels[employee.employmentStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/employees/${employee.id}`}>
                                <Eye className="mr-2 size-4" />
                                Xem chi tiết
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEdit(employee)}>
                              <Pencil className="mr-2 size-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            {employee.employmentStatus === 'ACTIVE' && (
                              <DropdownMenuItem onClick={() => handleOpenDelete(employee)} className="text-destructive">
                                <UserX className="mr-2 size-4" />
                                Ngừng sử dụng
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <ListPagination page={page} totalPages={totalPages} total={total} size={size} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận ngừng sử dụng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn ngừng sử dụng nhân viên <strong>{selectedEmployee?.fullName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
          </DialogHeader>
          <EmployeeForm employee={editingEmployee} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
