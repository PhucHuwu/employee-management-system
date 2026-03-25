'use client'

import { Button } from '@/components/ui/button'

interface ListPaginationProps {
  page: number
  totalPages: number
  total: number
  size: number
  onPageChange: (page: number) => void
}

export function ListPagination({ page, totalPages, total, size, onPageChange }: ListPaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * size + 1
  const end = Math.min(page * size, total)

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Hiển thị {start}-{end} / {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Trước
        </Button>
        <span className="text-sm text-muted-foreground">
          Trang {page}/{Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= Math.max(totalPages, 1)}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  )
}
