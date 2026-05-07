'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Briefcase, Users, Calendar, Mail, Phone, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { JobRequisition, Candidate, Interview } from '@/lib/types'
import { recruitmentApi } from '@/lib/api/endpoints'
import {
  TableSkeleton,
  JobRequisitionStatusBadge,
  CandidateStatusBadge,
  InterviewResultBadge,
  JOB_STATUS_OPTIONS,
  CANDIDATE_STATUS_OPTIONS,
} from './components'

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState('jobs')

  // Job Requisitions state
  const [jobs, setJobs] = useState<JobRequisition[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobFormOpen, setJobFormOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobRequisition | null>(null)
  const [jobForm, setJobForm] = useState({ title: '', department: '', status: 'OPEN' as string, description: '' })
  const [jobDeleteOpen, setJobDeleteOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobRequisition | null>(null)

  // Candidates state
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [candidatesLoading, setCandidatesLoading] = useState(true)
  const [candidateStatusFilter, setCandidateStatusFilter] = useState('')
  const [candidateFormOpen, setCandidateFormOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [candidateForm, setCandidateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobRequisitionId: '',
    status: 'NEW' as string,
    notes: '',
  })
  const [candidateDeleteOpen, setCandidateDeleteOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  // Candidate detail dialog
  const [candidateDetailOpen, setCandidateDetailOpen] = useState(false)
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [interviewsLoading, setInterviewsLoading] = useState(false)

  const fetchJobs = useCallback(async () => {
    setJobsLoading(true)
    try {
      const data = await recruitmentApi.getJobRequisitions({ size: 100 })
      setJobs(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách vị trí tuyển dụng')
    } finally {
      setJobsLoading(false)
    }
  }, [])

  const fetchCandidates = useCallback(async () => {
    setCandidatesLoading(true)
    try {
      const params: { status?: string; size: number } = { size: 100 }
      if (candidateStatusFilter) {
        params.status = candidateStatusFilter
      }
      const data = await recruitmentApi.getCandidates(params)
      setCandidates(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách ứng viên')
    } finally {
      setCandidatesLoading(false)
    }
  }, [candidateStatusFilter])

  useEffect(() => {
    void fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    void fetchCandidates()
  }, [fetchCandidates])

  // Job handlers
  const openCreateJob = () => {
    setEditingJob(null)
    setJobForm({ title: '', department: '', status: 'OPEN', description: '' })
    setJobFormOpen(true)
  }

  const openEditJob = (job: JobRequisition) => {
    setEditingJob(job)
    setJobForm({
      title: job.title,
      department: job.department,
      status: job.status,
      description: job.description ?? '',
    })
    setJobFormOpen(true)
  }

  const submitJob = async () => {
    if (!jobForm.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề')
      return
    }
    if (!jobForm.department.trim()) {
      toast.error('Vui lòng nhập phòng ban')
      return
    }
    try {
      const payload = {
        title: jobForm.title.trim(),
        department: jobForm.department.trim(),
        status: jobForm.status as JobRequisition['status'],
        description: jobForm.description.trim() || undefined,
      }
      if (editingJob) {
        await recruitmentApi.updateJobRequisition(editingJob.id, payload)
        toast.success('Cập nhật vị trí tuyển dụng thành công')
      } else {
        await recruitmentApi.createJobRequisition(payload)
        toast.success('Thêm vị trí tuyển dụng thành công')
      }
      setJobFormOpen(false)
      await fetchJobs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const openDeleteJob = (job: JobRequisition) => {
    setSelectedJob(job)
    setJobDeleteOpen(true)
  }

  const handleDeleteJob = async () => {
    if (!selectedJob) return
    try {
      await recruitmentApi.deleteJobRequisition(selectedJob.id)
      toast.success('Đã xóa vị trí tuyển dụng')
      setJobDeleteOpen(false)
      await fetchJobs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa vị trí tuyển dụng')
    }
  }

  // Candidate handlers
  const openCreateCandidate = () => {
    setEditingCandidate(null)
    setCandidateForm({ fullName: '', email: '', phone: '', jobRequisitionId: '', status: 'APPLIED', notes: '' })
    setCandidateFormOpen(true)
  }

  const openEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setCandidateForm({
      fullName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone ?? '',
      jobRequisitionId: candidate.jobRequisitionId,
      status: candidate.status,
      notes: candidate.notes ?? '',
    })
    setCandidateFormOpen(true)
  }

  const submitCandidate = async () => {
    if (!candidateForm.fullName.trim()) {
      toast.error('Vui lòng nhập tên ứng viên')
      return
    }
    if (!candidateForm.email.trim()) {
      toast.error('Vui lòng nhập email')
      return
    }
    if (!candidateForm.jobRequisitionId.trim()) {
      toast.error('Vui lòng chọn vị trí ứng tuyển')
      return
    }
    try {
      const payload = {
        fullName: candidateForm.fullName.trim(),
        email: candidateForm.email.trim(),
        phone: candidateForm.phone.trim() || undefined,
        jobRequisitionId: candidateForm.jobRequisitionId.trim(),
        status: candidateForm.status as Candidate['status'],
        notes: candidateForm.notes.trim() || undefined,
      }
      if (editingCandidate) {
        await recruitmentApi.updateCandidate(editingCandidate.id, payload)
        toast.success('Cập nhật ứng viên thành công')
      } else {
        await recruitmentApi.createCandidate(payload)
        toast.success('Thêm ứng viên thành công')
      }
      setCandidateFormOpen(false)
      await fetchCandidates()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thao tác thất bại')
    }
  }

  const openDeleteCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setCandidateDeleteOpen(true)
  }

  const handleDeleteCandidate = async () => {
    if (!selectedCandidate) return
    try {
      await recruitmentApi.deleteCandidate(selectedCandidate.id)
      toast.success('Đã xóa ứng viên')
      setCandidateDeleteOpen(false)
      await fetchCandidates()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa ứng viên')
    }
  }

  const openCandidateDetail = async (candidate: Candidate) => {
    setDetailCandidate(candidate)
    setCandidateDetailOpen(true)
    setInterviewsLoading(true)
    setInterviews([])
    try {
      const data = await recruitmentApi.getInterviews({ candidateId: candidate.id, size: 100 })
      setInterviews(data.items)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được lịch sử phỏng vấn')
    } finally {
      setInterviewsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tuyển dụng</h1>
          <p className="text-muted-foreground">Quản lý vị trí tuyển dụng và ứng viên</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="jobs">Vị trí tuyển dụng</TabsTrigger>
          <TabsTrigger value="candidates">Ứng viên</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground text-sm">Quản lý các vị trí đang tuyển dụng trong hệ thống</div>
            <Button onClick={openCreateJob}>
              <Plus className="mr-2 size-4" />
              Thêm vị trí
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách vị trí tuyển dụng</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <TableSkeleton />
              ) : jobs.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Briefcase className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Chưa có vị trí tuyển dụng</EmptyTitle>
                    <EmptyDescription>Hệ thống chưa có vị trí tuyển dụng nào.</EmptyDescription>
                  </EmptyHeader>
                  <Button onClick={openCreateJob} className="mt-4">
                    <Plus className="mr-2 size-4" />
                    Thêm vị trí đầu tiên
                  </Button>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Phòng ban</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Số ứng viên</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.department}</TableCell>
                        <TableCell>
                          <JobRequisitionStatusBadge status={job.status} />
                        </TableCell>
                        <TableCell>{job._count?.candidates ?? 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditJob(job)}>
                              <Pencil className="size-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteJob(job)}>
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

        <TabsContent value="candidates" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Select value={candidateStatusFilter} onValueChange={setCandidateStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả trạng thái</SelectItem>
                  {CANDIDATE_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={openCreateCandidate}>
              <Plus className="mr-2 size-4" />
              Thêm ứng viên
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách ứng viên</CardTitle>
            </CardHeader>
            <CardContent>
              {candidatesLoading ? (
                <TableSkeleton />
              ) : candidates.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Users className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Chưa có ứng viên</EmptyTitle>
                    <EmptyDescription>
                      {candidateStatusFilter
                        ? 'Không có ứng viên nào phù hợp với bộ lọc.'
                        : 'Hệ thống chưa có ứng viên nào.'}
                    </EmptyDescription>
                  </EmptyHeader>
                  <Button onClick={openCreateCandidate} className="mt-4">
                    <Plus className="mr-2 size-4" />
                    Thêm ứng viên đầu tiên
                  </Button>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vị trí ứng tuyển</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày nộp</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate) => (
                      <TableRow
                        key={candidate.id}
                        className="cursor-pointer"
                        onClick={() => openCandidateDetail(candidate)}
                      >
                        <TableCell className="font-medium">{candidate.fullName}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>{candidate.jobRequisition?.title ?? '-'}</TableCell>
                        <TableCell>
                          <CandidateStatusBadge status={candidate.status} />
                        </TableCell>
                        <TableCell>
                          {new Date(candidate.appliedAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => openEditCandidate(candidate)}>
                              <Pencil className="size-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteCandidate(candidate)}>
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

      {/* Job Form Dialog */}
      <Dialog open={jobFormOpen} onOpenChange={setJobFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? 'Chỉnh sửa vị trí tuyển dụng' : 'Thêm vị trí tuyển dụng mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="job-title">Tiêu đề</Label>
              <Input
                id="job-title"
                placeholder="Nhập tiêu đề vị trí..."
                value={jobForm.title}
                onChange={(e) => setJobForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-dept">Phòng ban</Label>
              <Input
                id="job-dept"
                placeholder="Nhập tên phòng ban..."
                value={jobForm.department}
                onChange={(e) => setJobForm((prev) => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-status">Trạng thái</Label>
              <Select
                value={jobForm.status}
                onValueChange={(value) => setJobForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="job-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-desc">Mô tả</Label>
              <Textarea
                id="job-desc"
                placeholder="Nhập mô tả vị trí..."
                value={jobForm.description}
                onChange={(e) => setJobForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setJobFormOpen(false)}>
                Hủy
              </Button>
              <Button onClick={submitJob}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Delete Dialog */}
      <AlertDialog open={jobDeleteOpen} onOpenChange={setJobDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vị trí tuyển dụng{' '}
              <strong>{selectedJob?.title}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJob}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Candidate Form Dialog */}
      <Dialog open={candidateFormOpen} onOpenChange={setCandidateFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCandidate ? 'Chỉnh sửa ứng viên' : 'Thêm ứng viên mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cand-name">Họ và tên</Label>
              <Input
                id="cand-name"
                placeholder="Nhập họ và tên..."
                value={candidateForm.fullName}
                onChange={(e) => setCandidateForm((prev) => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cand-email">Email</Label>
              <Input
                id="cand-email"
                type="email"
                placeholder="Nhập email..."
                value={candidateForm.email}
                onChange={(e) => setCandidateForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cand-phone">Số điện thoại</Label>
              <Input
                id="cand-phone"
                placeholder="Nhập số điện thoại..."
                value={candidateForm.phone}
                onChange={(e) => setCandidateForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cand-job">Vị trí ứng tuyển</Label>
              <Select
                value={candidateForm.jobRequisitionId}
                onValueChange={(value) => setCandidateForm((prev) => ({ ...prev, jobRequisitionId: value }))}
              >
                <SelectTrigger id="cand-job">
                  <SelectValue placeholder="Chọn vị trí" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cand-status">Trạng thái</Label>
              <Select
                value={candidateForm.status}
                onValueChange={(value) => setCandidateForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="cand-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANDIDATE_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cand-notes">Ghi chú</Label>
              <Textarea
                id="cand-notes"
                placeholder="Nhập ghi chú..."
                value={candidateForm.notes}
                onChange={(e) => setCandidateForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCandidateFormOpen(false)}>
                Hủy
              </Button>
              <Button onClick={submitCandidate}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Candidate Delete Dialog */}
      <AlertDialog open={candidateDeleteOpen} onOpenChange={setCandidateDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ứng viên{' '}
              <strong>{selectedCandidate?.fullName}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCandidate}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Candidate Detail Dialog */}
      <Dialog open={candidateDetailOpen} onOpenChange={setCandidateDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết ứng viên</DialogTitle>
          </DialogHeader>
          {detailCandidate && (
            <div className="space-y-6 py-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="font-medium">{detailCandidate.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <span>{detailCandidate.email}</span>
                </div>
                {detailCandidate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <span>{detailCandidate.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="size-4 text-muted-foreground" />
                  <span>{detailCandidate.jobRequisition?.title ?? '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>
                    Ngày nộp: {new Date(detailCandidate.appliedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span>Trạng thái:</span>
                  <CandidateStatusBadge status={detailCandidate.status} />
                </div>
                {detailCandidate.notes && (
                  <div className="text-muted-foreground text-sm">
                    <span className="font-medium">Ghi chú:</span> {detailCandidate.notes}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Lịch sử phỏng vấn</h3>
                {interviewsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : interviews.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    Chưa có lịch sử phỏng vấn.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {interviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            Vòng {interview.round} - {interview.interviewer}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {new Date(interview.scheduledAt).toLocaleString('vi-VN')}
                          </div>
                          {interview.notes && (
                            <div className="text-muted-foreground text-xs">
                              {interview.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {interview.score !== undefined && interview.score !== null && (
                            <span className="text-muted-foreground text-xs">
                              {interview.score} điểm
                            </span>
                          )}
                          <InterviewResultBadge result={interview.result} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
