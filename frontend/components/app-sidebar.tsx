'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  FileText,
  FolderKanban,
  Briefcase,
  Award,
  ScrollText,
  LogOut,
  ChevronDown,
  UserCheck,
  UserPlus,
  BookOpen,
  Wallet,
  UserCircle,
  Shield,
  MapPin,
  Receipt,
  Banknote,
  TrendingUp,
  Database,
  Brain,
  ClipboardList,
  Clock,
  UsersRound,
  Settings,
  CalendarDays,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import { Role } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

type MenuItem = {
  title: string
  url: string
  icon: typeof LayoutDashboard
  roles: Role[]
}

type MenuGroup = {
  title: string
  icon: typeof LayoutDashboard
  roles: Role[]
  items: Array<{
    title: string
    url: string
    roles: Role[]
  }>
}

type SidebarEntry = MenuItem | MenuGroup

const isMenuGroup = (item: SidebarEntry): item is MenuGroup => 'items' in item

const allMenuItems: SidebarEntry[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Admin', 'Manager', 'Employee'],
  },
  {
    title: 'Hồ sơ',
    url: '/profile',
    icon: UserCircle,
    roles: ['Admin', 'Manager', 'Employee'],
  },
  {
    title: 'Nhân viên',
    url: '/employees',
    icon: Users,
    roles: ['Admin', 'Manager'],
  },
  {
    title: 'Lịch làm việc',
    icon: Calendar,
    roles: ['Admin', 'Manager', 'Employee'],
    items: [
      {
        title: 'Lịch tổng hợp',
        url: '/schedule/calendar',
        roles: ['Admin', 'Manager'],
      },
      {
        title: 'Yêu cầu của tôi',
        url: '/schedule/requests',
        roles: ['Admin', 'Manager', 'Employee'],
      },
      {
        title: 'Chờ duyệt yêu cầu',
        url: '/schedule/approvals',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    title: 'Daily Report',
    url: '/daily-reports',
    icon: FileText,
    roles: ['Admin', 'Manager', 'Employee'],
  },
  {
    title: 'Dự án',
    url: '/projects',
    icon: FolderKanban,
    roles: ['Admin', 'Manager', 'Employee'],
  },
  {
    title: 'Phòng ban',
    url: '/departments',
    icon: Building2,
    roles: ['Admin', 'Manager'],
  },
  {
    title: 'Vị trí',
    url: '/positions',
    icon: Briefcase,
    roles: ['Admin', 'Manager'],
  },
  {
    title: 'Chức danh',
    url: '/job-titles',
    icon: Award,
    roles: ['Admin', 'Manager'],
  },
  {
    title: 'Ngày phép',
    url: '/leave-balances',
    icon: UserCheck,
    roles: ['Admin', 'Manager'],
  },
  {
    title: 'Tuyển dụng',
    icon: UserPlus,
    roles: ['Admin', 'Manager'],
    items: [
      {
        title: 'Danh sách',
        url: '/recruitment',
        roles: ['Admin', 'Manager'],
      },
      {
        title: 'Lịch phỏng vấn',
        url: '/interview-schedules',
        roles: ['Admin', 'Manager'],
      },
      {
        title: 'Báo cáo',
        url: '/recruitment-reports',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    title: 'Đào tạo',
    url: '/training',
    icon: BookOpen,
    roles: ['Admin', 'Manager'],
  },
  {
    title: 'Lương',
    url: '/payrolls',
    icon: Wallet,
    roles: ['Admin', 'Manager'],
  },
  {
    title: 'Chi phí',
    url: '/expense-claims',
    icon: Banknote,
    roles: ['Admin', 'Manager'],
  },
  {
    title: 'Hóa đơn',
    url: '/invoices',
    icon: Receipt,
    roles: ['Admin', 'Manager'],
  },
  {
    title: 'Công nợ',
    url: '/accounts-receivable',
    icon: TrendingUp,
    roles: ['Admin', 'Manager'],
  },
  {
    title: 'Master Data',
    icon: Database,
    roles: ['Admin'],
    items: [
      {
        title: 'Chi nhánh',
        url: '/branches',
        roles: ['Admin'],
      },
      {
        title: 'Loại học vấn',
        url: '/education-types',
        roles: ['Admin'],
      },
      {
        title: 'Học vấn',
        url: '/educations',
        roles: ['Admin'],
      },
      {
        title: 'Kỹ năng',
        url: '/skills',
        roles: ['Admin'],
      },
      {
        title: 'Nguồn CV',
        url: '/cv-sources',
        roles: ['Admin'],
      },
      {
        title: 'Vị trí phụ',
        url: '/sub-positions',
        roles: ['Admin'],
      },
      {
        title: 'Cài đặt vị trí',
        url: '/position-settings',
        roles: ['Admin'],
      },
    ],
  },
  {
    title: 'Năng lực & Đánh giá',
    icon: Brain,
    roles: ['Admin'],
    items: [
      {
        title: 'Tiêu chí năng lực',
        url: '/capabilities',
        roles: ['Admin'],
      },
      {
        title: 'Cài đặt năng lực',
        url: '/capability-settings',
        roles: ['Admin'],
      },
      {
        title: 'Thang điểm',
        url: '/score-settings',
        roles: ['Admin'],
      },
    ],
  },
  {
    title: 'Timesheet',
    icon: ClipboardList,
    roles: ['Admin', 'Manager', 'Employee'],
    items: [
      {
        title: 'Log timesheet',
        url: '/timesheet-entries',
        roles: ['Admin', 'Manager', 'Employee'],
      },
      {
        title: 'Duyệt timesheet',
        url: '/timesheet-approvals',
        roles: ['Admin', 'Manager'],
      },
      {
        title: 'Báo cáo',
        url: '/timesheet-reports',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    title: 'Review Intern',
    icon: UsersRound,
    roles: ['Admin', 'Manager'],
    items: [
      {
        title: 'Danh sách',
        url: '/review-interns',
        roles: ['Admin', 'Manager'],
      },
      {
        title: 'Báo cáo',
        url: '/review-intern-reports',
        roles: ['Admin', 'Manager'],
      },
    ],
  },
  {
    title: 'Team Building',
    url: '/team-building-requests',
    icon: CalendarDays,
    roles: ['Admin', 'Manager'],
  },
  {
    title: 'Onsite',
    url: '/onsite-requests',
    icon: MapPin,
    roles: ['Admin', 'Manager', 'Employee'],
  },
  {
    title: 'Đăng ký giờ làm',
    url: '/working-time-requests',
    icon: Clock,
    roles: ['Admin', 'Manager', 'Employee'],
  },
  {
    title: 'Cấu hình',
    icon: Settings,
    roles: ['Admin'],
    items: [
      {
        title: 'Loại nghỉ phép',
        url: '/leave-types',
        roles: ['Admin'],
      },
      {
        title: 'Ngày nghỉ lễ',
        url: '/off-days',
        roles: ['Admin'],
      },
      {
        title: 'Cài đặt hệ thống',
        url: '/system-settings',
        roles: ['Admin'],
      },
    ],
  },
  {
    title: 'Audit Logs',
    url: '/audit-logs',
    icon: ScrollText,
    roles: ['Admin'],
  },
  {
    title: 'Phân quyền',
    url: '/admin/permissions',
    icon: Shield,
    roles: ['Admin'],
  },
  {
    title: 'Phạm vi quản lý',
    url: '/admin/manager-scopes',
    icon: MapPin,
    roles: ['Admin'],
  },
]

function filterMenuByRole(items: SidebarEntry[], role: Role): SidebarEntry[] {
  return items
    .filter((item) => item.roles.includes(role))
    .map((item) => {
      if (isMenuGroup(item)) {
        const filteredItems = item.items.filter((sub) => sub.roles.includes(role))
        if (filteredItems.length === 0) return null
        return { ...item, items: filteredItems }
      }
      return item
    })
    .filter(Boolean) as SidebarEntry[]
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const visibleMenuItems = user ? filterMenuByRole(allMenuItems, user.role) : []

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border/30 bg-sidebar-primary/10">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <Users className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">EMS</span>
            <span className="text-[11px] text-sidebar-foreground/70">Hệ thống quản lý nhân sự</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => {
                if (isMenuGroup(item)) {
                  const isSubActive = item.items.some((sub) =>
                    pathname.startsWith(sub.url)
                  )
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={isSubActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.url}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                >
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto py-2">
                  <Avatar className="size-8">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>
                      {user?.fullName ? getInitials(user.fullName) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{user?.fullName || 'Người dùng'}</span>
                    <span className="text-xs text-muted-foreground">{user?.role || 'Role'}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserCircle className="mr-2 size-4" />
                    <span>Hồ sơ</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 size-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
