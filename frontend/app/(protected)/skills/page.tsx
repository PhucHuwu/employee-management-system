'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react'
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
import type { Skill } from '@/lib/types'
import { skillApi } from '@/lib/api/endpoints'

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

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [formName, setFormName] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  const fetchSkills = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await skillApi.getAll({ size: 100 })
      setSkills(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách kỹ năng')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSkills()
  }, [fetchSkills])

  const handleOpenCreate = () => {
    setEditingSkill(null)
    setFormName('')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (skill: Skill) => {
    setEditingSkill(skill)
    setFormName(skill.name)
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên kỹ năng')
      return
    }
    try {
      if (editingSkill) {
        await skillApi.update(editingSkill.id, { name: formName.trim() })
        toast.success('Cập nhật kỹ năng thành công')
      } else {
        await skillApi.create({ name: formName.trim() })
        toast.success('Thêm kỹ năng thành công')
      }
      setIsFormOpen(false)
      await fetchSkills()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const handleOpenDelete = (skill: Skill) => {
    setSelectedSkill(skill)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedSkill) return
    try {
      await skillApi.delete(selectedSkill.id)
      toast.success('Đã xóa kỹ năng')
      setDeleteDialogOpen(false)
      await fetchSkills()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa kỹ năng')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kỹ năng</h1>
          <p className="text-muted-foreground">Quản lý danh sách kỹ năng trong hệ thống</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Thêm kỹ năng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách kỹ năng</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : skills.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Wrench className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có kỹ năng</EmptyTitle>
                <EmptyDescription>Hệ thống chưa có kỹ năng nào.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 size-4" />
                Thêm kỹ năng đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên kỹ năng</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>{new Date(skill.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(skill)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(skill)}>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Chỉnh sửa kỹ năng' : 'Thêm kỹ năng mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Tên kỹ năng</Label>
              <Input
                id="skill-name"
                placeholder="Nhập tên kỹ năng..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Hủy</Button>
              <Button onClick={handleSubmit}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa kỹ năng <strong>{selectedSkill?.name}</strong>? Hành động này không thể hoàn tác.
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
