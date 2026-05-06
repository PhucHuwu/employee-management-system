export const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Nhân viên',
  schedule: 'Lịch làm việc',
  calendar: 'Lịch tổng hợp',
  approvals: 'Chờ duyệt yêu cầu',
  'daily-reports': 'Daily Report',
  projects: 'Dự án',
  positions: 'Vị trí',
  'job-titles': 'Chức danh',
  'audit-logs': 'Audit Logs',
  departments: 'Phòng ban',
}

export function buildBreadcrumbItems(pathname: string): Array<{ label: string; href?: string }> {
  const segments = pathname.split('/').filter(Boolean)
  const items: Array<{ label: string; href?: string }> = []

  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
    if (isUuid) {
      items.push({ label: 'Chi tiết' })
    } else {
      const label = breadcrumbMap[segment] || segment
      items.push({ label, href: i < segments.length - 1 ? currentPath : undefined })
    }
  }

  return items
}
