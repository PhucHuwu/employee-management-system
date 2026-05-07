'use client'

import { Briefcase, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="ml-auto h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

export function JobRequisitionStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    DRAFT: 'outline',
    OPEN: 'default',
    CLOSED: 'secondary',
    FILLED: 'default',
    CANCELLED: 'destructive',
  }
  const labelMap: Record<string, string> = {
    DRAFT: 'Bản nháp',
    OPEN: 'Đang mở',
    CLOSED: 'Đã đóng',
    FILLED: 'Đã tuyển',
    CANCELLED: 'Đã hủy',
  }
  return (
    <Badge variant={variantMap[status] ?? 'outline'}>
      {labelMap[status] ?? status}
    </Badge>
  )
}

export function CandidateStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    NEW: 'outline',
    SCHEDULED_TEST: 'secondary',
    FAILED_TEST: 'destructive',
    REJECTED_TEST: 'destructive',
    SCHEDULED_INTERVIEW: 'secondary',
    PASSED_INTERVIEW: 'default',
    FAILED_INTERVIEW: 'destructive',
    REJECTED_INTERVIEW: 'destructive',
    ACCEPTED_OFFER: 'default',
    REJECTED_OFFER: 'destructive',
    ONBOARDED: 'default',
    REJECTED_APPLY: 'destructive',
  }
  const labelMap: Record<string, string> = {
    NEW: 'Mới',
    SCHEDULED_TEST: 'Lên lịch test',
    FAILED_TEST: 'Trượt test',
    REJECTED_TEST: 'Từ chối test',
    SCHEDULED_INTERVIEW: 'Lên lịch PV',
    PASSED_INTERVIEW: 'Đậu PV',
    FAILED_INTERVIEW: 'Trượt PV',
    REJECTED_INTERVIEW: 'Từ chối PV',
    ACCEPTED_OFFER: 'Nhận offer',
    REJECTED_OFFER: 'Từ chối offer',
    ONBOARDED: 'Đã onboard',
    REJECTED_APPLY: 'Từ chối đơn',
  }
  return (
    <Badge variant={variantMap[status] ?? 'outline'}>
      {labelMap[status] ?? status}
    </Badge>
  )
}

export function InterviewResultBadge({ result }: { result: string }) {
  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDING: 'outline',
    PASSED: 'default',
    FAILED: 'destructive',
    NO_SHOW: 'secondary',
  }
  const labelMap: Record<string, string> = {
    PENDING: 'Chờ kết quả',
    PASSED: 'Đạt',
    FAILED: 'Không đạt',
    NO_SHOW: 'Vắng mặt',
  }
  return (
    <Badge variant={variantMap[result] ?? 'outline'}>
      {labelMap[result] ?? result}
    </Badge>
  )
}

export function JobsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Briefcase className="size-5" />
        </EmptyMedia>
        <EmptyTitle>Chưa có vị trí tuyển dụng</EmptyTitle>
        <EmptyDescription>Hệ thống chưa có vị trí tuyển dụng nào.</EmptyDescription>
      </EmptyHeader>
      <Button onClick={onCreate} className="mt-4">
        <Briefcase className="mr-2 size-4" />
        Thêm vị trí đầu tiên
      </Button>
    </Empty>
  )
}

export function CandidatesEmptyState({ onCreate, filtered }: { onCreate: () => void; filtered: boolean }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users className="size-5" />
        </EmptyMedia>
        <EmptyTitle>Chưa có ứng viên</EmptyTitle>
        <EmptyDescription>
          {filtered
            ? 'Không có ứng viên nào phù hợp với bộ lọc.'
            : 'Hệ thống chưa có ứng viên nào.'}
        </EmptyDescription>
      </EmptyHeader>
      <Button onClick={onCreate} className="mt-4">
        <Users className="mr-2 size-4" />
        Thêm ứng viên đầu tiên
      </Button>
    </Empty>
  )
}

export const JOB_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'OPEN', label: 'Đang mở' },
  { value: 'CLOSED', label: 'Đã đóng' },
  { value: 'FILLED', label: 'Đã tuyển' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

export const CANDIDATE_STATUS_OPTIONS = [
  { value: 'NEW', label: 'Mới' },
  { value: 'SCHEDULED_TEST', label: 'Lên lịch test' },
  { value: 'FAILED_TEST', label: 'Trượt test' },
  { value: 'REJECTED_TEST', label: 'Từ chối test' },
  { value: 'SCHEDULED_INTERVIEW', label: 'Lên lịch PV' },
  { value: 'PASSED_INTERVIEW', label: 'Đậu PV' },
  { value: 'FAILED_INTERVIEW', label: 'Trượt PV' },
  { value: 'REJECTED_INTERVIEW', label: 'Từ chối PV' },
  { value: 'ACCEPTED_OFFER', label: 'Nhận offer' },
  { value: 'REJECTED_OFFER', label: 'Từ chối offer' },
  { value: 'ONBOARDED', label: 'Đã onboard' },
  { value: 'REJECTED_APPLY', label: 'Từ chối đơn' },
]
