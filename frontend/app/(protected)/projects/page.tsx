'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, FolderKanban } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ListPagination } from '@/components/ui/list-pagination'
import type { Project, ProjectStatus } from '@/lib/types'
import { ProjectForm } from '@/components/projects/project-form'
import { projectApi } from '@/lib/api/endpoints'

const statusLabels: Record<ProjectStatus, string> = {
  RUNNING: 'Đang chạy',
  PAUSED: 'Tạm dừng',
  ENDED: 'Kết thúc',
}

const statusVariants: Record<ProjectStatus, 'default' | 'secondary' | 'outline'> = {
  RUNNING: 'default',
  PAUSED: 'secondary',
  ENDED: 'outline',
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await projectApi.getAll({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        size,
      })
      setProjects(data.items)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách dự án')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, page, size])

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  const filteredProjects = useMemo(
    () => projects.filter((proj) => proj.name.toLowerCase().includes(searchKeyword.toLowerCase()) || proj.code.toLowerCase().includes(searchKeyword.toLowerCase())),
    [projects, searchKeyword]
  )

  const handleDelete = async () => {
    if (!selectedProject) return
    try {
      await projectApi.delete(selectedProject.id)
      toast.success('Đã xóa dự án thành công')
      setDeleteDialogOpen(false)
      setSelectedProject(null)
      await fetchProjects()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa dự án')
    }
  }

  const handleFormSuccess = async () => {
    setIsFormOpen(false)
    setEditingProject(null)
    toast.success(editingProject ? 'Cập nhật dự án thành công' : 'Thêm dự án thành công')
    await fetchProjects()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dự án</h1>
          <p className="text-muted-foreground">Quản lý các dự án trong hệ thống</p>
        </div>
        <Button onClick={() => { setEditingProject(null); setIsFormOpen(true) }}>
          <Plus className="mr-2 size-4" />Thêm dự án
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FolderKanban className="size-5" />Danh sách dự án</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Tìm kiếm theo tên hoặc mã dự án..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="RUNNING">Đang chạy</SelectItem>
                <SelectItem value="PAUSED">Tạm dừng</SelectItem>
                <SelectItem value="ENDED">Kết thúc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? <TableSkeleton /> : filteredProjects.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><FolderKanban className="size-5" /></EmptyMedia>
                <EmptyTitle>Không có dự án</EmptyTitle>
                <EmptyDescription>{searchKeyword || statusFilter !== 'all' ? 'Không tìm thấy dự án phù hợp với bộ lọc' : 'Chưa có dự án nào trong hệ thống'}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader><TableRow><TableHead>Mã</TableHead><TableHead>Tên dự án</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thành viên</TableHead><TableHead>Ngày bắt đầu</TableHead><TableHead>Ngày kết thúc</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-sm">{project.code}</TableCell>
                      <TableCell><div><Link href={`/projects/${project.id}`} className="font-medium hover:underline">{project.name}</Link>{project.description && <p className="line-clamp-1 text-sm text-muted-foreground">{project.description}</p>}</div></TableCell>
                      <TableCell><Badge variant={statusVariants[project.status]}>{statusLabels[project.status]}</Badge></TableCell>
                      <TableCell>{project._count?.members || 0}</TableCell>
                      <TableCell>{new Date(project.startDate).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /><span className="sr-only">Menu</span></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/projects/${project.id}`}><Eye className="mr-2 size-4" />Xem chi tiết</Link></DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditingProject(project); setIsFormOpen(true) }}><Pencil className="mr-2 size-4" />Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedProject(project); setDeleteDialogOpen(true) }}><Trash2 className="mr-2 size-4" />Xóa</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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
            <AlertDialogTitle>Xác nhận xóa dự án</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc chắn muốn xóa dự án <strong>{selectedProject?.name}</strong>? Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Xác nhận xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingProject ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}</DialogTitle></DialogHeader>
          <ProjectForm project={editingProject} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
