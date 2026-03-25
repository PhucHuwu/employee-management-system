# KẾ HOẠCH TRIỂN KHAI FRONTEND - Employee Management System

## 1) Mục tiêu tài liệu

- Mô tả plan thực hiện frontend cho phạm vi Manager/Admin theo `docs/project.md` và `docs/system-analysis-design.md`.
- Chuẩn hóa cấu trúc trang, điều hướng, hợp đồng API frontend cần tích hợp.
- Tạo baseline cho việc coding UI theo từng phase, đảm bảo đồng bộ với backend REST API.

## 2) Phạm vi frontend

## 2.1 Trong phạm vi
- Đăng nhập và kiểm soát truy cập theo role (`Admin`, `Manager`).
- Các module: Employee, Schedule/Approval, Daily Report, Project/Customer/Document/Revenue, Position, Job Title/Promotion, Audit (view cơ bản).
- Dashboard quản trị ở mức tổng quan vận hành.

## 2.2 Ngoài phạm vi
- Màn hình employee self-service.
- Payroll, chấm công tự động, ERP/accounting integration.

## 3) Đề xuất công nghệ frontend

- Framework: Next.js (App Router) + TypeScript.
- Routing: file-based routing theo chuẩn Next.js.
- State management:
  - Server state: TanStack Query.
  - UI state cục bộ: React hooks.
- Form: React Hook Form + Zod validator.
- UI kit: có thể dùng Ant Design/Material UI hoặc design system nội bộ.
- Date/time: dayjs.
- Runtime: Node.js.
- Ngôn ngữ giao diện: Tiếng Việt (có dấu), locale mặc định `vi-VN`.

Ghi chú: stack này đề xuất để tối ưu tốc độ triển khai, có thể thay thế nếu team đã có chuẩn khác.

## 4) Cấu trúc thông tin và điều hướng

## 4.1 Sitemap
- `/login`
- `/dashboard`
- `/employees`
- `/employees/[id]`
- `/schedule/calendar`
- `/schedule/approvals`
- `/daily-reports`
- `/projects`
- `/projects/[id]`
- `/positions`
- `/job-titles`
- `/audit-logs` (có thể bật sau)

## 4.2 Menu bên trái (Manager/Admin)
- Dashboard
- Nhân viên
- Lịch làm việc
  - Lịch tổng hợp
  - Chờ duyệt yêu cầu
- Daily report
- Dự án
- Position
- Job title
- Audit logs (Admin)

## 4.3 Guard và phân quyền route
- Chưa login -> chỉ vào `/login`.
- `Manager`:
  - Được xem/sửa trong phạm vi scope.
  - Có quyền approve/reject schedule request trong team.
- `Admin`:
  - Toàn quyền CRUD danh mục và dữ liệu.

## 5) Cấu trúc thư mục frontend đề xuất

```text
src/
  app/
    (auth)/
      login/
        page.tsx
    (protected)/
      dashboard/
        page.tsx
      employees/
        page.tsx
        [id]/
          page.tsx
      schedule/
        calendar/
          page.tsx
        approvals/
          page.tsx
      daily-reports/
        page.tsx
      projects/
        page.tsx
        [id]/
          page.tsx
      positions/
        page.tsx
      job-titles/
        page.tsx
      audit-logs/
        page.tsx
    api/
      auth/
        [...nextauth]/route.ts
    layout.tsx
    page.tsx
    providers/
    middleware.ts
  shared/
    api/
      client.ts
      endpoints/
    components/
    hooks/
    utils/
    constants/
    types/
  features/
    auth/
    dashboard/
    employee/
    schedule/
    daily-report/
    project/
    position/
    job-title/
    audit/
  layouts/
```

Quy tắc:
- Mỗi feature gồm: `api.ts`, `types.ts`, `components/`, `hooks/`.
- Tách rõ component tái sử dụng (`shared/components`) và component theo module (`features/*/components`).
- Ưu tiên Server Components cho phần đọc dữ liệu; dùng Client Components cho form, modal, thao tác tương tác cao.

## 6) Danh sách trang và yêu cầu UI

## 6.1 Login (`/login`)
- Form đăng nhập (email/username + password).
- Xử lý token lưu secure storage (ưu tiên httpOnly cookie nếu backend hỗ trợ).
- Redirect theo role vào `/dashboard`.

## 6.2 Dashboard (`/dashboard`)
- Thể hiện KPI nhanh:
  - Số employee active/inactive.
  - Số request đang chờ duyệt.
  - Số project đang RUNNING.
- Widget lịch hôm nay (off/remote).

## 6.3 Employee list (`/employees`)
- Filter: keyword, department, project, position, job title, status.
- Bảng phân trang, sort cơ bản.
- Action: xem chi tiết, sửa, ngừng sử dụng.
- Nút thêm nhân viên.

## 6.4 Employee detail (`/employees/:id`)
- Tabs:
  - Thông tin chung
  - Dự án
  - Daily
  - Lịch sử chức vụ (timeline)
  - Lịch sử thay đổi
- Form cập nhật fixed schedule (`SHIFT_8_5`, `SHIFT_9_6`).

## 6.5 Schedule calendar (`/schedule/calendar`)
- Calendar/heatmap theo ngày trong khoảng from-to.
- Mỗi ngày hiện chips số lượng: off full-day, remote full-day, off AM/PM, remote AM/PM.
- Click chip/ngày -> mở drawer drill-down danh sách nhân viên.

## 6.6 Approval queue (`/schedule/approvals`)
- Bảng request `PENDING` + filter type/employee/date range.
- Action:
  - Duyệt
  - Từ chối (modal bắt buộc nhập lý do)
- Sau thao tác, auto refresh queue + summary.

## 6.7 Daily reports (`/daily-reports`)
- Chọn employee + project + date range.
- Hiển thị bảng/timeline theo ngày.
- Bảo đảm context một employee, không trộn dữ liệu employee khác.

## 6.8 Project list (`/projects`)
- CRUD project, filter theo status (`RUNNING`, `PAUSED`, `ENDED`).
- Điều hướng vào project detail.

## 6.9 Project detail (`/projects/:id`)
- Tabs:
  - Tổng quan
  - Members
  - Documents
  - Customers
  - Revenues
  - Daily progress
- Members: add/remove, role trong project.
- Documents: upload/list/download/delete.
- Customers: link/unlink customer với project.
- Revenues: CRUD theo kỳ, type `FORECAST`/`ACTUAL`.

## 6.10 Position (`/positions`)
- CRUD position.
- Chặn xóa khi đang được tham chiếu (hiện thông báo lỗi từ backend).

## 6.11 Job title (`/job-titles`)
- CRUD job title (`levelOrder`).
- Từ employee detail, trigger promotion modal.

## 6.12 Audit logs (`/audit-logs`)
- Danh sách log theo actor, action, entity, date range.
- Phần này có thể triển khai phase sau nếu backend chưa mở endpoint.

## 7) Hợp đồng API frontend cần tích hợp

Nguồn endpoint: SAD mục 7.

## 7.1 Auth
- `POST /api/auth/login`
  - Request: `{ usernameOrEmail, password }`
  - Response: `{ accessToken, refreshToken?, user: { id, role, scopes } }`

## 7.2 Employee
- `GET /api/employees?keyword=&departmentId=&projectId=&positionId=&jobTitleId=&status=&page=&size=`
- `POST /api/employees`
- `GET /api/employees/{id}`
- `PUT /api/employees/{id}`
- `DELETE /api/employees/{id}` (soft delete)

Payload tối thiểu:
- `fullName`, `dob`, `address`, `departmentId`, `positionId`, `fixedSchedule`, `projectIds?`.

## 7.3 Schedule & Approval
- `GET /api/schedule-requests?status=PENDING&type=&employeeId=&from=&to=`
- `POST /api/schedule-requests/{id}/approve`
- `POST /api/schedule-requests/{id}/reject`
  - Request reject: `{ rejectionReason }` (bắt buộc)
- `GET /api/schedules/daily-summary?from=&to=&departmentId=&projectId=`
- `GET /api/schedules/daily-drilldown?date=&type=`

## 7.4 Daily report
- `GET /api/daily-reports?employeeId=&projectId=&from=&to=&page=&size=`
- `GET /api/projects/{projectId}/daily-progress?memberId=&from=&to=`

## 7.5 Project & Customer
- `GET/POST/PUT/DELETE /api/projects`
- `POST /api/projects/{id}/members`
- `DELETE /api/projects/{id}/members/{employeeId}`
- `GET/POST/PUT/DELETE /api/customers`
- `POST /api/projects/{id}/documents`
- `GET /api/projects/{id}/documents`
- `DELETE /api/projects/{id}/documents/{docId}`
- `GET/POST/PUT/DELETE /api/projects/{id}/revenues`

## 7.6 Position / Job Title / Promotion
- `GET/POST/PUT/DELETE /api/positions`
- `GET/POST/PUT/DELETE /api/job-titles`
- `POST /api/employees/{id}/promotions`
- `GET /api/employees/{id}/promotions`

## 7.7 Quy ước API response cho frontend
- Đề xuất response list:
  - `{ items: T[], page, size, total, totalPages }`
- Đề xuất response lỗi:
  - `{ code, message, details?, requestId }`

## 8) Data model frontend (types) cần có

- `User`, `Role`, `Scope`
- `Employee`, `EmployeeDetail`, `FixedSchedule`
- `ScheduleRequest`, `ScheduleRequestType`, `ScheduleRequestStatus`
- `DailyReport`
- `Project`, `ProjectMember`, `ProjectStatus`
- `Customer`, `ProjectCustomer`
- `ProjectDocument`
- `ProjectRevenue`, `RevenueType`
- `Position`, `JobTitle`, `PromotionHistory`
- `AuditLog`

## 9) Luồng nghiệp vụ quan trọng trên UI

## 9.1 Duyệt/Từ chối schedule request
1. Mở trang queue.
2. Filter request cần xử lý.
3. Click Duyệt hoặc Từ chối.
4. Nếu Từ chối -> modal bắt buộc nhập lý do.
5. Gọi API approve/reject.
6. Refresh queue + calendar summary.

## 9.2 Promote nhân viên
1. Mở employee detail -> tab lịch sử chức vụ.
2. Click Promote, chọn job title mới + effective date + reason.
3. Gọi API promotions.
4. Cập nhật timeline và thông tin hiện tại.

## 9.3 Quản lý dự án tại project detail
1. Chọn project.
2. Manage members/customers/documents/revenues theo từng tab.
3. Mỗi thao tác thành công -> invalidate query liên quan.

## 10) Validation và UX rule

- Form employee:
  - `dob` <= ngày hiện tại.
  - `fixedSchedule` chỉ cho 2 giá trị.
- Reject request bắt buộc `rejectionReason`.
- Các hành động destructive có confirm modal.
- Hiển thị toast thông báo thành công/thất bại.
- Empty state rõ ràng cho bảng/lịch.

## 11) Error handling và quan sát

- Interceptor API xử lý:
  - 401 -> logout + redirect login.
  - 403 -> thông báo không đủ quyền.
  - 5xx -> thông báo chung + `requestId` để trace.
- Ghi log frontend (optional): Sentry hoặc hệ thống APM.
- Dùng `error.tsx` và `not-found.tsx` theo route segment của Next.js cho UX lỗi nhất quán.

## 12) Kế hoạch triển khai theo phase

## Phase 1 (Core HR)
- Login + layout + route guard.
- Employee list/detail.
- Schedule calendar + approval queue.
- Daily reports cơ bản.
- Position + Job title + promotion UI.

## Phase 2 (Project domain)
- Project list/detail.
- Members + Customers + Revenues.
- Documents upload/list/delete/download.

## Phase 3 (Hardening)
- Dashboard nâng cao.
- Audit logs page.
- Tối ưu UX, loading states, performance, accessibility.

## 13) Test frontend

- Unit test:
  - Utility, mapper, validator, hooks.
- Component test:
  - Form validation, modal confirm, table filter.
- E2E test:
  - Login -> Employee CRUD (mock backend).
  - Approval reject có lý do.
  - Promote flow.
  - Project detail tabs.

Công cụ đề xuất:
- Unit/component: Jest hoặc Vitest + Testing Library.
- E2E: Playwright.

## 14) Definition of Done cho frontend

Một feature frontend được xem là DONE khi:

1. UI đúng với flow nghiệp vụ trong SAD.
2. Tích hợp API thành công (happy path + error path).
3. Có validation client-side cần thiết.
4. Có test tối thiểu theo mức độ feature.
5. Đã kiểm tra responsive desktop/mobile.
6. Đã cập nhật tài liệu route, API map, và changelog.

## 15) Phụ lục - API map theo trang

- `/employees` -> `GET /api/employees`, `DELETE /api/employees/{id}`
- `/employees/[id]` -> `GET /api/employees/{id}`, `PUT /api/employees/{id}`, `GET/POST promotions`
- `/schedule/calendar` -> `GET /api/schedules/daily-summary`, `GET /api/schedules/daily-drilldown`
- `/schedule/approvals` -> `GET /api/schedule-requests`, `POST approve/reject`
- `/daily-reports` -> `GET /api/daily-reports`
- `/projects` -> `GET/POST/PUT/DELETE /api/projects`
- `/projects/[id]` -> members/documents/revenues/progress endpoints
- `/positions` -> `GET/POST/PUT/DELETE /api/positions`
- `/job-titles` -> `GET/POST/PUT/DELETE /api/job-titles`
- `/audit-logs` -> endpoint audit (khi backend mở)
