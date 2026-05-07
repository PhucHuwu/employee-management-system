'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Shield, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import apiClient from '@/lib/api/client'

interface Permission {
  id: string
  resource: string
  action: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  ownership: string
  allowed: boolean
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
}

const ownershipLabels: Record<string, string> = {
  any: 'Tất cả',
  own: 'Của mình',
  scope: 'Phạm vi',
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-10" />
        </div>
      ))}
    </div>
  )
}

export default function PermissionsAdminPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [resourceFilter, setResourceFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get<Permission[]>('/admin/permissions')
      setPermissions(res)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách phân quyền')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPermissions()
  }, [fetchPermissions])

  const resources = useMemo(() => {
    const set = new Set(permissions.map((p) => p.resource))
    return Array.from(set).sort()
  }, [permissions])

  const filtered = useMemo(() => {
    return permissions.filter((p) => {
      if (resourceFilter !== 'all' && p.resource !== resourceFilter) return false
      if (roleFilter !== 'all' && p.role !== roleFilter) return false
      return true
    })
  }, [permissions, resourceFilter, roleFilter])

  const handleToggle = async (permission: Permission) => {
    try {
      await apiClient.put(`/admin/permissions/${permission.id}`, {
        allowed: !permission.allowed,
      })
      setPermissions((prev) =>
        prev.map((p) => (p.id === permission.id ? { ...p, allowed: !p.allowed } : p))
      )
      toast.success('Cập nhật phân quyền thành công')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cập nhật thất bại')
    }
  }

  const handleOwnershipChange = async (permission: Permission, ownership: string) => {
    try {
      await apiClient.put(`/admin/permissions/${permission.id}`, { ownership })
      setPermissions((prev) =>
        prev.map((p) => (p.id === permission.id ? { ...p, ownership } : p))
      )
      toast.success('Cập nhật phạm vi thành công')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cập nhật thất bại')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Phân quyền</h1>
        <p className="text-muted-foreground">Quản lý ma trận phân quyền theo vai trò và tài nguyên</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="size-5" />Bộ lọc</CardTitle>
          <CardDescription>Lọc theo tài nguyên và vai trò</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger><SelectValue placeholder="Tài nguyên" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tài nguyên</SelectItem>
                {resources.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger><SelectValue placeholder="Vai trò" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setResourceFilter('all'); setRoleFilter('all') }}>Xóa bộ lọc</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ma trận phân quyền</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><Shield className="size-5" /></EmptyMedia>
                <EmptyTitle>Không có quyền</EmptyTitle>
                <EmptyDescription>Không tìm thấy quyền nào phù hợp với bộ lọc</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tài nguyên</TableHead>
                    <TableHead>Hành động</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Phạm vi</TableHead>
                    <TableHead className="text-center">Cho phép</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium capitalize">{p.resource}</TableCell>
                      <TableCell>{p.action}</TableCell>
                      <TableCell><Badge variant="outline">{roleLabels[p.role]}</Badge></TableCell>
                      <TableCell>
                        <Select value={p.ownership} onValueChange={(v) => handleOwnershipChange(p, v)}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">{ownershipLabels.any}</SelectItem>
                            <SelectItem value="own">{ownershipLabels.own}</SelectItem>
                            <SelectItem value="scope">{ownershipLabels.scope}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={p.allowed} onCheckedChange={() => handleToggle(p)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
