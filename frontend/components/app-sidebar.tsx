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

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Nhân viên',
    url: '/employees',
    icon: Users,
  },
  {
    title: 'Lịch làm việc',
    icon: Calendar,
    items: [
      {
        title: 'Lịch tổng hợp',
        url: '/schedule/calendar',
      },
      {
        title: 'Chờ duyệt yêu cầu',
        url: '/schedule/approvals',
      },
    ],
  },
  {
    title: 'Daily Report',
    url: '/daily-reports',
    icon: FileText,
  },
  {
    title: 'Dự án',
    url: '/projects',
    icon: FolderKanban,
  },
  {
    title: 'Phòng ban',
    url: '/departments',
    icon: Building2,
  },
  {
    title: 'Vị trí',
    url: '/positions',
    icon: Briefcase,
  },
  {
    title: 'Chức danh',
    url: '/job-titles',
    icon: Award,
  },
]

const adminOnlyItems = [
  {
    title: 'Audit Logs',
    url: '/audit-logs',
    icon: ScrollText,
  },
]

type MenuItem = {
  title: string
  icon: typeof LayoutDashboard
  url: string
}

type MenuGroup = {
  title: string
  icon: typeof LayoutDashboard
  items: Array<{
    title: string
    url: string
  }>
}

type SidebarEntry = MenuItem | MenuGroup

const hasChildren = (item: SidebarEntry): item is MenuGroup => 'items' in item

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout, hasRole } = useAuth()

  const allMenuItems: SidebarEntry[] = hasRole('Admin')
    ? [...menuItems, ...adminOnlyItems]
    : menuItems

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
              {allMenuItems.map((item) => {
                if (hasChildren(item)) {
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
                            {item.items.map((subItem: { title: string; url: string }) => (
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
