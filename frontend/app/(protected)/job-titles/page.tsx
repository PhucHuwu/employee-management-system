'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Award, ArrowUp } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import type { JobTitle } from '@/lib/types'
import { JobTitleForm } from '@/components/job-titles/job-title-form'
import { jobTitleApi } from '@/lib/api/endpoints'

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}

export default function JobTitlesPage() {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedJobTitle, setSelectedJobTitle] = useState<JobTitle | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingJobTitle, setEditingJobTitle] = useState<JobTitle | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchJobTitles = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await jobTitleApi.getAll({ size: 100 })
      setJobTitles(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách chức danh')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchJobTitles()
  }, [fetchJobTitles])

  const filteredJobTitles = useMemo(
    () => jobTitles.filter((jt) => jt.name.toLowerCase().includes(searchKeyword.toLowerCase())).sort((a, b) => a.levelOrder - b.levelOrder),
    [jobTitles, searchKeyword]
  )

  const handleDelete = async () => {
    if (!selectedJobTitle) return

    try {
      await jobTitleApi.delete(selectedJobTitle.id)
      toast.success('Đã xóa chức danh thành công')
      setDeleteDialogOpen(false)
      setSelectedJobTitle(null)
      setDeleteError(null)
      await fetchJobTitles()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa chức danh'
      setDeleteError(message)
    }
  }

  const handleOpenDelete = (jobTitle: JobTitle) => {
    setSelectedJobTitle(jobTitle)
    setDeleteError(null)
    setDeleteDialogOpen(true)
  }

  const handleOpenEdit = (jobTitle: JobTitle) => {
    setEditingJobTitle(jobTitle)
    setIsFormOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingJobTitle(null)
    setIsFormOpen(true)
  }

  const handleFormSuccess = async () => {
    setIsFormOpen(false)
    setEditingJobTitle(null)
    toast.success(editingJobTitle ? 'Cập nhật chức danh thành công' : 'Thêm chức danh thành công')
    await fetchJobTitles()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chức danh</h1>
          <p className="text-muted-foreground">Quản lý danh sách chức danh và cấp bậc</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm chức danh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5" />
            Danh sách chức danh
          </CardTitle>
          <CardDescription>Các chức danh được sắp xếp theo cấp bậc từ thấp đến cao</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm chức danh..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : filteredJobTitles.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Award className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Không có chức danh</EmptyTitle>
                <EmptyDescription>
                  {searchKeyword ? 'Không tìm thấy chức danh phù hợp' : 'Chưa có chức danh nào trong hệ thống'}
                </EmptyDescription>
              </EmptyHeader>
              {!searchKeyword && (
                <Button onClick={handleOpenCreate} className="mt-4">
                  <Plus className="mr-2 size-4" />
                  Thêm chức danh đầu tiên
                </Button>
              )}
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Cấp bậc</TableHead>
                  <TableHead>Tên chức danh</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobTitles.map((jobTitle) => (
                  <TableRow key={jobTitle.id}>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <ArrowUp className="size-3" />
                        Level {jobTitle.levelOrder}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{jobTitle.name}</TableCell>
                    <TableCell className="text-muted-foreground">{jobTitle.description || '-'}</TableCell>
                    <TableCell>{new Date(jobTitle.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(jobTitle)}>
                            <Pencil className="mr-2 size-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDelete(jobTitle)} className="text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeleteError(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chức danh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chức danh <strong>{selectedJobTitle?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{deleteError}</div>}
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingJobTitle ? 'Chỉnh sửa chức danh' : 'Thêm chức danh mới'}</DialogTitle>
          </DialogHeader>
          <JobTitleForm jobTitle={editingJobTitle} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
