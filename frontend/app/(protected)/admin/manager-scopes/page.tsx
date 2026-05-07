'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapPin, Pencil, Building2, FolderKanban, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import apiClient from '@/lib/api/client'
import { departmentApi, projectApi } from '@/lib/api/endpoints'
import type { Department, Project } from '@/lib/types'

interface ManagerScope {
  id: string
  email: string
  role: string
  departmentScopeId: string | null
  projectScopeIds: string[]
  scopeEmployeeIds: string[]
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}

export default function ManagerScopesAdminPage() {
  const [managers, setManagers] = useState<ManagerScope[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingManager, setEditingManager] = useState<ManagerScope | null>(null)
  const [editDept, setEditDept] = useState<string>('')
  const [editProjects, setEditProjects] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [managersRes, deptsRes, projsRes] = await Promise.all([
        apiClient.get<ManagerScope[]>('/admin/manager-scopes'),
        departmentApi.getAll({ size: 100 }),
        projectApi.getAll({ size: 100 }),
      ])
      setManagers(managersRes)
      setDepartments(deptsRes.items ?? [])
      setProjects(projsRes.items ?? [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách quản lý')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    if (!search.trim()) return managers
    const q = search.toLowerCase()
    return managers.filter((m) => m.email.toLowerCase().includes(q))
  }, [managers, search])

  const openEdit = (manager: ManagerScope) => {
    setEditingManager(manager)
    setEditDept(manager.departmentScopeId || '_none_')
    setEditProjects(manager.projectScopeIds || [])
  }

  const closeEdit = () => {
    setEditingManager(null)
    setEditDept('')
    setEditProjects([])
  }

  const handleSave = async () => {
    if (!editingManager) return
    setIsSaving(true)
    try {
      await apiClient.put(`/admin/manager-scopes/${editingManager.id}`, {
        departmentScopeId: editDept === '_none_' ? null : editDept,
        projectScopeIds: editProjects,
      })
      setManagers((prev) =>
        prev.map((m) =>
          m.id === editingManager.id
            ? {
                ...m,
                departmentScopeId: editDept === '_none_' ? null : editDept,
                projectScopeIds: editProjects,
              }
            : m
        )
      )
      toast.success('Cập nhật phạm vi quản lý thành công')
      closeEdit()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cập nhật thất bại')
    } finally {
      setIsSaving(false)
    }
  }

  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` })),
    [projects]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Phạm vi quản lý</h1>
        <p className="text-muted-foreground">Quản lý phạm vi phòng ban và dự án của các Manager</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="size-5" />Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Tìm theo email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danh sách Manager</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><MapPin className="size-5" /></EmptyMedia>
                <EmptyTitle>Không có Manager</EmptyTitle>
                <EmptyDescription>Không tìm thấy Manager nào phù hợp</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Dự án</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.email}</TableCell>
                    <TableCell>
                      {m.departmentScopeId ? (
                        <Badge variant="outline" className="flex w-fit items-center gap-1">
                          <Building2 className="size-3" />
                          {departments.find((d) => d.id === m.departmentScopeId)?.name || m.departmentScopeId}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {m.projectScopeIds && m.projectScopeIds.length > 0 ? (
                          m.projectScopeIds.map((pid) => (
                            <Badge key={pid} variant="secondary" className="flex items-center gap-1">
                              <FolderKanban className="size-3" />
                              {projects.find((p) => p.id === pid)?.code || pid}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                        <Pencil className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingManager} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phạm vi quản lý</DialogTitle>
            <DialogDescription>{editingManager?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Phòng ban quản lý</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
              >
                <option value="_none_">Không giới hạn phòng ban</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Dự án quản lý</Label>
              <MultiSelect
                options={projectOptions}
                selected={editProjects}
                onChange={setEditProjects}
                placeholder="Chọn dự án..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>Hủy</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
