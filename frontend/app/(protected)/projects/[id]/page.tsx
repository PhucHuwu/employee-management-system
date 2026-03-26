'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Users, FileText, DollarSign, Building2, Calendar, Plus, Trash2, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { ProjectDetail, ProjectStatus, ProjectMember, ProjectDocument, ProjectRevenue, ProjectCustomer } from '@/lib/types'
import { ProjectForm } from '@/components/projects/project-form'
import { AddMemberForm } from '@/components/projects/add-member-form'
import { AddRevenueForm } from '@/components/projects/add-revenue-form'
import { ProjectDailyReportsCalendar } from '@/components/projects/project-daily-reports-calendar'
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount)
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Skeleton className="size-8 rounded" /><Skeleton className="h-8 w-48" /></div>
      <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
    </div>
  )
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [customers, setCustomers] = useState<ProjectCustomer[]>([])
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [revenues, setRevenues] = useState<ProjectRevenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'member' | 'document' | 'revenue' | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const fetchProject = useCallback(async () => {
    setIsLoading(true)
    try {
      const [detail, docs, revs] = await Promise.all([
        projectApi.getById(projectId),
        projectApi.getDocuments(projectId),
        projectApi.getRevenues(projectId),
      ])
      setProject(detail)
      setMembers(detail.members || [])
      setCustomers(detail.customers || [])
      setDocuments(docs)
      setRevenues(revs)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được chi tiết dự án')
      setProject(null)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void fetchProject()
  }, [fetchProject])

  const handleDelete = async () => {
    if (!deleteType || !deleteId || !project) return
    try {
      if (deleteType === 'member') {
        const member = members.find((m) => m.id === deleteId)
        if (member) await projectApi.removeMember(project.id, member.employeeId)
      }
      if (deleteType === 'document') {
        await projectApi.deleteDocument(project.id, deleteId)
      }
      if (deleteType === 'revenue') {
        await projectApi.deleteRevenue(project.id, deleteId)
      }
      toast.success('Xóa thành công')
      setDeleteType(null)
      setDeleteId(null)
      await fetchProject()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa dữ liệu')
    }
  }

  const handleUploadDocument = async (file: File) => {
    if (!project) return
    setIsUploading(true)
    try {
      await projectApi.uploadDocument(project.id, file)
      toast.success('Tải tài liệu thành công')
      await fetchProject()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Tải tài liệu thất bại')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadDocument = async (doc: ProjectDocument) => {
    if (!project) return
    try {
      const data = await projectApi.downloadDocument(project.id, doc.id)
      const binary = atob(data.contentBase64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes], { type: data.mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải tài liệu')
    }
  }

  const revenueRows = useMemo(() => [...revenues].sort((a, b) => (b.periodYear - a.periodYear) || (b.periodMonth - a.periodMonth)), [revenues])

  if (isLoading) return <DetailSkeleton />

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Empty><EmptyHeader><EmptyMedia variant="icon"><Building2 className="size-5" /></EmptyMedia><EmptyTitle>Không tìm thấy dự án</EmptyTitle></EmptyHeader><Button asChild className="mt-4"><Link href="/projects">Quay lại danh sách</Link></Button></Empty>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="size-4" /></Button>
          <div>
            <div className="flex items-center gap-2"><h1 className="text-2xl font-bold tracking-tight">{project.name}</h1><Badge variant={statusVariants[project.status]}>{statusLabels[project.status]}</Badge></div>
            <p className="text-muted-foreground">{project.code}</p>
          </div>
        </div>
        <Button onClick={() => setIsEditOpen(true)}><Pencil className="mr-2 size-4" />Chỉnh sửa</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin dự án</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3"><div className="rounded-lg bg-muted p-2"><Calendar className="size-4 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Ngày bắt đầu</p><p className="font-medium">{new Date(project.startDate).toLocaleDateString('vi-VN')}</p></div></div>
            <div className="flex items-center gap-3"><div className="rounded-lg bg-muted p-2"><Calendar className="size-4 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Ngày kết thúc</p><p className="font-medium">{project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</p></div></div>
            <div className="flex items-center gap-3"><div className="rounded-lg bg-muted p-2"><Users className="size-4 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Số thành viên</p><p className="font-medium">{members.length}</p></div></div>
            <div className="flex items-center gap-3"><div className="rounded-lg bg-muted p-2"><Building2 className="size-4 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Khách hàng</p><p className="font-medium">{customers.length}</p></div></div>
          </div>
          {project.description && (<><Separator className="my-4" /><p>{project.description}</p></>)}
        </CardContent>
      </Card>

      <Card>
        <Tabs defaultValue="members">
          <CardHeader><TabsList><TabsTrigger value="members">Thành viên</TabsTrigger><TabsTrigger value="customers">Khách hàng</TabsTrigger><TabsTrigger value="documents">Tài liệu</TabsTrigger><TabsTrigger value="revenues">Doanh thu</TabsTrigger><TabsTrigger value="dailyReports">Daily report</TabsTrigger></TabsList></CardHeader>
          <CardContent>
            <TabsContent value="members" className="mt-0">
              <div className="mb-4 flex justify-end"><Button size="sm" onClick={() => setIsAddMemberOpen(true)}><Plus className="mr-2 size-4" />Thêm thành viên</Button></div>
              {members.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead>Vai trò</TableHead><TableHead>Ngày tham gia</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
                  <TableBody>{members.map((member) => (<TableRow key={member.id}><TableCell><Link href={`/employees/${member.employeeId}`} className="font-medium hover:underline">{member.employee?.fullName || member.employeeId}</Link></TableCell><TableCell>{member.roleInProject || '-'}</TableCell><TableCell>{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('vi-VN') : '-'}</TableCell><TableCell><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { setDeleteType('member'); setDeleteId(member.id) }}><Trash2 className="size-4" /></Button></TableCell></TableRow>))}</TableBody>
                </Table>
              ) : <Empty><EmptyHeader><EmptyTitle>Chưa có thành viên</EmptyTitle></EmptyHeader></Empty>}
            </TabsContent>

            <TabsContent value="customers" className="mt-0">
              {customers.length > 0 ? (
                <Table><TableHeader><TableRow><TableHead>Tên khách hàng</TableHead></TableRow></TableHeader><TableBody>{customers.map((customer) => <TableRow key={customer.id}><TableCell className="font-medium">{customer.customer?.companyName || customer.customerId}</TableCell></TableRow>)}</TableBody></Table>
              ) : <Empty><EmptyHeader><EmptyTitle>Chưa có khách hàng</EmptyTitle></EmptyHeader></Empty>}
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUploadDocument(f); e.currentTarget.value = '' }} />
              <div className="mb-4 flex justify-end"><Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}><Upload className="mr-2 size-4" />{isUploading ? 'Đang tải...' : 'Tải lên tài liệu'}</Button></div>
              {documents.length > 0 ? (
                <Table><TableHeader><TableRow><TableHead>Tên file</TableHead><TableHead>Kích thước</TableHead><TableHead>Ngày tải</TableHead><TableHead className="w-24" /></TableRow></TableHeader><TableBody>{documents.map((doc) => (<TableRow key={doc.id}><TableCell className="font-medium"><div className="flex items-center gap-2"><FileText className="size-4 text-muted-foreground" />{doc.fileName}</div></TableCell><TableCell>{formatFileSize(doc.sizeBytes)}</TableCell><TableCell>{new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}</TableCell><TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => void handleDownloadDocument(doc)}><Download className="size-4" /></Button><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { setDeleteType('document'); setDeleteId(doc.id) }}><Trash2 className="size-4" /></Button></div></TableCell></TableRow>))}</TableBody></Table>
              ) : <Empty><EmptyHeader><EmptyTitle>Chưa có tài liệu</EmptyTitle></EmptyHeader></Empty>}
            </TabsContent>

            <TabsContent value="revenues" className="mt-0">
              <div className="mb-4 flex justify-end"><Button size="sm" onClick={() => setIsAddRevenueOpen(true)}><Plus className="mr-2 size-4" />Thêm doanh thu</Button></div>
              {revenueRows.length > 0 ? (
                <Table><TableHeader><TableRow><TableHead>Kỳ</TableHead><TableHead>Loại</TableHead><TableHead>Số tiền</TableHead><TableHead>Ghi chú</TableHead><TableHead className="w-12" /></TableRow></TableHeader><TableBody>{revenueRows.map((revenue) => (<TableRow key={revenue.id}><TableCell className="font-medium">{`${revenue.periodMonth}/${revenue.periodYear}`}</TableCell><TableCell><Badge variant={revenue.revenueType === 'FORECAST' ? 'secondary' : 'default'}>{revenue.revenueType === 'FORECAST' ? 'Dự kiến' : 'Thực tế'}</Badge></TableCell><TableCell className="font-mono">{formatCurrency(revenue.amount, revenue.currency)}</TableCell><TableCell className="text-muted-foreground">{revenue.note || '-'}</TableCell><TableCell><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { setDeleteType('revenue'); setDeleteId(revenue.id) }}><Trash2 className="size-4" /></Button></TableCell></TableRow>))}</TableBody></Table>
              ) : <Empty><EmptyHeader><EmptyTitle>Chưa có dữ liệu doanh thu</EmptyTitle></EmptyHeader></Empty>}
            </TabsContent>

            <TabsContent value="dailyReports" className="mt-0">
              <ProjectDailyReportsCalendar projectId={project.id} members={members} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Chỉnh sửa dự án</DialogTitle></DialogHeader><ProjectForm project={project} onSuccess={() => { setIsEditOpen(false); void fetchProject() }} onCancel={() => setIsEditOpen(false)} /></DialogContent>
      </Dialog>

      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent><DialogHeader><DialogTitle>Thêm thành viên</DialogTitle></DialogHeader><AddMemberForm projectId={project.id} onSuccess={() => { setIsAddMemberOpen(false); void fetchProject() }} onCancel={() => setIsAddMemberOpen(false)} /></DialogContent>
      </Dialog>

      <Dialog open={isAddRevenueOpen} onOpenChange={setIsAddRevenueOpen}>
        <DialogContent><DialogHeader><DialogTitle>Thêm doanh thu</DialogTitle></DialogHeader><AddRevenueForm projectId={project.id} onSuccess={() => { setIsAddRevenueOpen(false); void fetchProject() }} onCancel={() => setIsAddRevenueOpen(false)} /></DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteType} onOpenChange={() => setDeleteType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Xác nhận xóa</AlertDialogTitle><AlertDialogDescription>Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Xác nhận xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
