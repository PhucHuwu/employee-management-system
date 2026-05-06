# PLAN — Lộ trình triển khai MIS chuyên nghiệp

> Mục tiêu: Nâng `employee-management-system` từ hệ thống quản lý nhân sự cơ bản lên **Enterprise MIS** đáp ứng đầy đủ 4 loại hệ thống con (TPS, IPS, DSS, Programmed Decision) và các tiêu chí ERP, SCM, Security theo khung MIS Odisha.

---

## 1. Phân tích hiện trạng (AS-IS)

### 1.1 Thành phần đã có
| Module | Chức năng | Đánh giá |
|--------|-----------|----------|
| Identity | JWT login, RBAC (Admin/Manager), Data Scope Guard | Cơ bản đủ dùng |
| Employee Master | CRUD, soft delete, department/position linkage | TPS cấp đơn giản |
| Job Title / Position | Quản lý chức danh, thăng chức, bulk update | TPS cấp đơn giản |
| Project | CRUD, members, customers, documents, revenues | TPS nâng cao |
| Daily Report | Báo cáo công việc hàng ngày theo dự án | TPS nâng cao |
| Schedule | Request off/remote/change shift, approve/reject | TPS + Workflow nhẹ |
| Audit Log | Ghi log thay đổi dữ liệu | Security cơ bản |

### 1.2 Điểm yếu so với khung MIS
- **Chưa có IPS**: Không có báo cáo tổng hợp, exception report, dashboard cấp quản lý.
- **Chưa có DSS**: Không có mô hình phân tích, what-if, forecast, profitability analysis.
- **Chưa có Programmed Decision**: Không có rule-based auto-approval, auto-alert.
- **ERP chưa đầy đủ**: Thiếu Financial Accounting, Payroll, Procurement, Inventory.
- **HR chưa đầy đủ**: Thiếu Recruitment, Training, Leave Balance, Performance Review.
- **SCM chưa có**: Không quản lý nhà cung cấp, mua hàng, tồn kho tài sản.
- **Security chưa mạnh**: Thiếu 2FA, password policy, session management, encryption.

---

## 2. Mục tiêu TO-BE

Xây dựng hệ thống đạt 4 tiêu chí:

1. **TPS hoàn chỉnh** — xử lý giao dịch hằng ngày: attendance, expense, procurement, payroll.
2. **IPS hiệu quả** — cung cấp báo cáo đúng lúc, đúng đối tượng: dashboard, exception report, scheduled reports.
3. **DSS hỗ trợ quyết định** — phân tích what-if, forecast, resource optimization.
4. **EIS cho lãnh đạo** — tổng quan chiến lược: KPIs, trend analysis, profitability.

---

## 3. Lộ trình triển khai theo Phase

### Phase 1 — IPS & EIS Foundation (Tuần 1–2)
**Mục tiêu**: Có thể nhìn thấy và ra quyết định từ dữ liệu.

| # | Tính năng | Mô tả kỹ thuật |
|---|-----------|----------------|
| 1.1 | Executive Dashboard API | Aggregation endpoints: tổng nhân viên, dự án active, doanh thu tháng, pending approvals |
| 1.2 | Executive Dashboard UI | Next.js page `/dashboard` với widgets: stats cards, revenue chart, project status pie |
| 1.3 | Exception Reports | API trả về danh sách ngoại lệ: dự án trễ hạn (>7 ngày đến deadline), nhân viên missing daily report > 2 ngày, budget overrun |
| 1.4 | Scheduled Email Reports | NestJS scheduler (Bull or node-cron): gửi báo cáo tuần tự động cho manager |
| 1.5 | Revenue Analytics | API trả forecast vs actual theo tháng/quý/năm; UI biểu đồ (Recharts hoặc Tremor) |
| 1.6 | Resource Utilization | Tính % allocation nhân viên vào dự án so với capacity theo tuần |

### Phase 2 — TPS mở rộng: HR & Payroll (Tuần 3–5)
**Mục tiêu**: TPS đầy đủ cho toàn bộ vòng đờ nhân sự.

| # | Tính năng | Mô tả kỹ thuật |
|---|-----------|----------------|
| 2.1 | Leave Balance Schema | Bảng `LeaveBalance` (annualLeave, sickLeave, unpaidTaken, year). Prisma migration + seed |
| 2.2 | Leave Deduction Logic | Khi approve `ScheduleRequest` (OFF_FULL_DAY / OFF_AM / OFF_PM), tự động trừ leave balance |
| 2.3 | Leave Balance UI | Trang nhân viên xem số ngày phép còn lại |
| 2.4 | Recruitment Module | Schema: `JobRequisition`, `Candidate`, `Interview`. API CRUD + pipeline stages (Applied → Interview → Offer → Hired) |
| 2.5 | Recruitment UI | Trang `/recruitment` quản lý job requisitions và candidate board |
| 2.6 | Training Module | Schema: `TrainingPlan`, `TrainingRecord`. Theo dõi khóa đào tạo, ngày hết hạn chứng chỉ |
| 2.7 | Training Alert | Scheduled job nhắc chứng chỉ sắp hết hạn (30 ngày) |
| 2.8 | Payroll Schema | Bảng `Payroll`, `PayrollItem`, `SalaryStructure`. Lưu lương cơ bản, phụ cấp, thưởng, khấu trừ |
| 2.9 | Payroll Calculation | Service tính lương tháng dựa trên: salary structure + approved schedule (công thực tế) + project bonus |
| 2.10 | Payslip UI | Nhân viên xem payslip cá nhân; Admin xem danh sách payroll tháng |

### Phase 3 — TPS & ERP: Project Financials (Tuần 6–7)
**Mục tiêu**: Quản lý tài chính dự án và công nợ.

| # | Tính năng | Mô tả kỹ thuật |
|---|-----------|----------------|
| 3.1 | Project Budget Schema | Bảng `ProjectBudget` (budgetedAmount, category: labor/equipment/overhead). Mối quan hệ 1-n với Project |
| 3.2 | Expense Claim Schema | Bảng `ExpenseClaim` (employeeId, projectId, amount, category, receiptUrl, status: pending/approved/rejected) |
| 3.3 | Expense Claim Workflow | API create → Manager approve → Auto cộng vào actual cost dự án |
| 3.4 | Budget vs Actual Report | API so sánh budgeted vs actual (labor + expenses + revenues) theo dự án |
| 3.5 | Invoicing Schema | Bảng `Invoice` (customerId, projectId, invoiceDate, dueDate, totalAmount, status: draft/sent/paid/overdue) |
| 3.6 | Invoice Generation | Tạo invoice từ `ProjectRevenue` (actual). Auto tính subtotal, tax, total |
| 3.7 | Accounts Receivable | API aging report: 0-30, 31-60, 61-90, >90 ngày quá hạn |
| 3.8 | Invoice & AR UI | Trang `/invoices` và `/accounts-receivable` |

### Phase 4 — DSS: Decision Support (Tuần 8–9)
**Mục tiêu**: Hỗ trợ ra quyết định bằng mô hình và phân tích.

| # | Tính năng | Mô tả kỹ thuật |
|---|-----------|----------------|
| 4.1 | Project Profitability API | Profit = Revenue − (Labor Cost + Expenses). Tính profit margin theo dự án và theo khách hàng |
| 4.2 | What-if Resource Planning | API nhận input: projectId, số nhân viên thêm, lương TB, thời gian → trả về dự báo chi phí và tiến độ mới |
| 4.3 | Workload Forecast | API dự báo workload theo tháng dựa trên số dự án active và số nhân viên available |
| 4.4 | DSS UI | Trang `/analytics` với profitability table, what-if calculator form, workload forecast chart |
| 4.5 | KPI Engine | Bảng `KpiDefinition`, `KpiValue`. Tính toán định kỳ: employee utilization, project margin, customer satisfaction (nếu có) |

### Phase 5 — Programmed Decision & Automation (Tuần 10)
**Mục tiêu**: Giảm thao tác thủ công lặp lại.

| # | Tính năng | Mô tả kỹ thuật |
|---|-----------|----------------|
| 5.1 | Auto-approval Rules | Bảng `ApprovalRule` (requestType, maxDays, autoApprove: boolean). Ví dụ: REMOTE < 2 ngày/tuần → auto approve |
| 5.2 | Missing Daily Report Alert | Cron job 17:30 hàng ngày: tìm nhân viên chưa có daily report → gửi email/notification |
| 5.3 | Project Deadline Alert | Cron job hàng ngày: tìm dự án còn 7 ngày đến endDate và status=RUNNING → alert manager |
| 5.4 | Budget Overrun Alert | Khi actual cost vượt 90% budget → alert admin |
| 5.5 | Notification Center | Schema `Notification` (userId, type, message, readAt). API list/mark-read. UI bell icon ở header |

### Phase 6 — SCM nhẹ & Assets (Tuần 11)
**Mục tiêu**: Quản lý mua sắm và tài sản cho dự án.

| # | Tính năng | Mô tả kỹ thuật |
|---|-----------|----------------|
| 6.1 | Vendor/Supplier Schema | Bảng `Vendor` (name, contact, paymentTerms, rating). CRUD API |
| 6.2 | Purchase Request | Bảng `PurchaseRequest` (projectId, requesterId, itemDesc, qty, estimatedCost, vendorId, status). Workflow: request → manager approve → purchase order |
| 6.3 | Asset Schema | Bảng `Asset` (name, serialNo, purchaseDate, value, status: available/assigned/disposed) |
| 6.4 | Asset Assignment | Bảng `AssetAssignment` (assetId, employeeId, assignedAt, returnedAt). Theo dõi ai đang giữ tài sản nào |
| 6.5 | Asset UI | Trang `/assets` quản lý tài sản công ty |

### Phase 7 — Security Hardening (Tuần 12)
**Mục tiêu**: Đạt tiêu chuẩn bảo mật MIS Ch. 16.

| # | Tính năng | Mô tả kỹ thuật |
|---|-----------|----------------|
| 7.1 | Password Policy | Enforce: min 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt. Không cho đổi lại mật khẩu cũ trong 90 ngày |
| 7.2 | 2FA / TOTP | Tích hợp `speakeasy` hoặc `otplib`: Admin bắt buộc bật 2FA. QR setup + verify endpoint |
| 7.3 | Session Management | Bảng `UserSession` (tokenJti, ip, userAgent, createdAt, expiresAt). API revoke session, list active sessions |
| 7.4 | Rate Limiting | `@nestjs/throttler` cho auth endpoints và public APIs |
| 7.5 | Sensitive Data Encryption | Mã hóa AES-256 trước khi lưu: CCCD (nếu có), số tài khoản ngân hàng, lương chi tiết. Dùng `crypto` module Node.js |
| 7.6 | Backup Policy | Script tự động dump PostgreSQL hàng ngày. Lưu 7 ngày gần nhất. Tài liệu hóa quy trình restore |

---

## 4. Kiến trúc kỹ thuật

### 4.1 Công nghệ giữ nguyên
- Backend: NestJS + TypeScript + Prisma + PostgreSQL
- Frontend: Next.js App Router + React + TypeScript
- Auth: JWT ( Passport + `@nestjs/jwt` )
- Storage: Local / S3 (MinIO) — đã có abstraction

### 4.2 Công nghệ bổ sung
| Thành phần | Gói / Công cụ | Mục đích |
|------------|---------------|----------|
| Job Queue | Bull + Redis | Scheduled reports, notifications, alerts |
| Charts | Recharts hoặc Tremor | Dashboard, analytics UI |
| Email | Nodemailer + SMTP / SendGrid | Scheduled reports, alerts |
| 2FA | otplib | TOTP generation/verification |
| Rate Limit | `@nestjs/throttler` | API protection |
| Encryption | Node.js `crypto` (AES-256-GCM) | Sensitive fields |

### 4.3 Thay đổi Schema lớn
- `LeaveBalance`, `LeaveTransaction`
- `JobRequisition`, `Candidate`, `Interview`
- `TrainingPlan`, `TrainingRecord`
- `Payroll`, `PayrollItem`, `SalaryStructure`
- `ProjectBudget`, `ExpenseClaim`
- `Invoice`, `InvoiceItem`
- `KpiDefinition`, `KpiValue`
- `ApprovalRule`
- `Notification`
- `Vendor`, `PurchaseRequest`, `PurchaseOrder`
- `Asset`, `AssetAssignment`
- `UserSession`

---

## 5. Tiêu chí đánh giá (Definition of Done)

Mỗi phase phải đạt:

- [ ] **Unit test coverage >= 80%** cho API mới.
- [ ] **Integration test** cho workflow quan trọng (approve → side effects).
- [ ] **Frontend E2E** (Playwright) cho critical user flows.
- [ ] **Audit log** ghi nhận mọi thay đổi trạng thái quan trọng.
- [ ] **RBAC**: đúng role mới được truy cập.
- [ ] **API documentation**: cập nhật DTO và endpoint mô tả rõ ràng.
- [ ] **Migration Prisma** chạy được trên PostgreSQL production-like.

---

## 6. Risk & Mitigation

| Rủi ro | Ảnh hưởng | Biện pháp |
|--------|-----------|-----------|
| Schema thay đổi quá lớn gây mất data | Cao | Backup trước mỗi migration; viết migration reversible; test trên staging |
| Performance aggregation với data lớn | Trung bình | Thêm index đúng; dùng materialized view cho report phức tạp; cache Redis |
| Email/notification spam | Trung bình | Rate limit per user; batch notification; cho phép user tắt loại alert |
| Tính toán lương sai | Cao | Viết unit test kỹ cho payroll calculation; review chéo formula; log chi tiết |

---

## 7. Timeline tóm tắt

| Phase | Thời gian | Deliverable chính |
|-------|-----------|-------------------|
| 1 — IPS & EIS | Tuần 1–2 | Dashboard, Exception Reports, Revenue Analytics |
| 2 — HR & Payroll | Tuần 3–5 | Leave, Recruitment, Training, Payroll, Payslip |
| 3 — Project Financials | Tuần 6–7 | Budget, Expense, Invoice, AR |
| 4 — DSS | Tuần 8–9 | Profitability, What-if, Forecast, KPI |
| 5 — Automation | Tuần 10 | Auto-approval, Alerts, Notification Center |
| 6 — SCM & Assets | Tuần 11 | Vendor, Purchase, Asset Management |
| 7 — Security | Tuần 12 | 2FA, Password Policy, Session, Encryption, Backup |

---

## 8. Nguyên tắc thực hiện

> **Understand → Simplify → Automate** (Nguyên tắc USA từ ERP Chapter)

1. Hiểu rõ yêu cầu nghiệp vụ trước khi viết code.
2. Đơn giản hóa workflow: không thêm bước thủ công không cần thiết.
3. Tự động hóa sau cùng, khi quy trình đã ổn định.
4. Không bỏ qua bước **TDD**: viết test trước, implement sau.
5. Mỗi phase là **incremental**: có thể deploy độc lập, không phụ thuộc phase sau.

---

*PLAN này được xây dựng dựa trên:*
- *Giáo trình MIS Odisha (Ch. 1–16)*
- *Stack hiện tại: NestJS, Next.js, Prisma, PostgreSQL*
- *Nguyên tắc phát triển: TDD, Immutable Data, RBAC, Audit Trail*
