# KẾ HOẠCH LẬP TRÌNH (3 DEVELOPER) — Employee Management System

## 1) Mục tiêu và phạm vi triển khai

- Mục tiêu: triển khai backend phục vụ đầy đủ FR-1 đến FR-6 theo `docs/project.md` và `docs/system-analysis-design.md`.
- Team: `datlt`, `anhlt`, `phucth`.
- Tech stack bắt buộc:
  - Backend: Node.js
  - Ngôn ngữ: TypeScript
  - Database: PostgreSQL

## 2) Kiến trúc và chuẩn kỹ thuật đề xuất

## 2.1 Stack triển khai
- Framework API: NestJS (Node.js + TypeScript, modular theo domain).
- ORM/Migration: Prisma (bắt buộc), quản lý schema + migration tập trung qua Prisma Migrate.
- Auth: JWT + RBAC + data-scope theo team/department/project.
- File storage: S3-compatible hoặc Azure Blob (cho project documents).
- Logging/Audit: structured log + bảng `audit_logs`.

## 2.2 Chuẩn code
- Chuẩn API: RESTful, validate input bằng DTO + class-validator.
- Chuẩn chất lượng: ESLint + Prettier + commit convention.
- Testing:
  - Unit test cho service/business rule.
  - Integration test cho repository + DB.
  - API e2e test cho luồng trọng yếu (approve/reject/promotion).
- DB migration bắt buộc qua migration scripts, không chỉnh tay trực tiếp production DB.

## 3) Các quyết định nghiệp vụ cần chốt trước coding (T-0)

Phải chốt trong 1-2 ngày đầu để tránh rework:

1. Quy tắc xung đột request nửa buổi/full-day (đề xuất theo SAD mục 3.2).
2. Quan hệ `customer-project`: chọn 1-n hay n-n (SAD khuyến nghị n-n).
3. Ràng buộc daily: unique theo `(employee, date, project)` hay `(employee, date)`.
4. Data-scope của Manager: theo phòng ban, theo project, hay kết hợp cả hai.

## 4) Phân rã module theo người phụ trách

## 4.1 `datlt` — Core nền tảng + Employee/Position/Job Title
- Thiết lập project skeleton backend, config môi trường, CI cơ bản.
- Module Identity & Access:
  - Auth JWT, guard RBAC, role `Admin/Manager`.
  - Data-scope middleware/guard.
- Module Employee (FR-1): CRUD, filter/search, soft delete.
- Module Position (FR-5): CRUD + chặn xóa khi đang tham chiếu.
- Module Job Title & Promotion (FR-6): CRUD, promote, timeline/history.
- Audit log cho thay đổi nhạy cảm (employee update, position/job title change, promotion).

## 4.2 `anhlt` — Schedule/Approval + Daily
- Module Schedule Request (FR-2):
  - Queue PENDING + filter.
  - Approve/reject (reject bắt buộc lý do).
  - Luồng đổi fixed schedule khi duyệt.
  - Daily summary + daily drill-down endpoint.
  - Xử lý conflict rule theo quyết định T-0.
- Module Daily Report (FR-3):
  - Truy vấn theo employee/date range/project.
  - Bảo đảm không lộ dữ liệu nhân viên khác.
- Viết integration/e2e test cho luồng approve/reject/schedule summary.

## 4.3 `phucth` — Project/Customer/Document/Revenue
- Module Project (FR-4.1, 4.2, 4.3): CRUD project, project members, daily progress by project.
- Module Customer (FR-4.5, 3.4.1): CRUD customer + liên kết project-customer theo mô hình đã chốt.
- Module Document (FR-4.4): upload/list/download/delete metadata + storage adapter.
- Module Revenue (FR-4.6): CRUD revenue theo kỳ, phân loại FORECAST/ACTUAL.
- Audit log cho thay đổi doanh thu, tài liệu, gán khách hàng.

## 5) Kế hoạch theo sprint (đề xuất 4 sprint / 8 tuần)

## Sprint 0 (Tuần 1) — Foundation & Design Lock
- Chốt 4 quyết định nghiệp vụ T-0.
- Dựng project backend Node.js + TypeScript.
- Thiết kế `prisma/schema.prisma` v1 + migration baseline bằng Prisma Migrate.
- Setup CI (lint + test + build) và môi trường local/dev.

**Phân công**
- `datlt`: khởi tạo kiến trúc, auth skeleton, Prisma migration framework.
- `anhlt`: thiết kế chi tiết schedule/daily rule + test cases.
- `phucth`: thiết kế detail schema project/customer/document/revenue.

## Sprint 1 (Tuần 2-3) — Phase 1 Core HR
- Hoàn thiện Employee + Position + JobTitle/Promotion.
- Hoàn thiện Schedule Request queue/approve/reject/change fixed schedule.
- Hoàn thiện Daily Report read/query.
- Bàn giao API draft + Postman collection nội bộ.

**Mốc nghiệm thu Sprint 1**
- FR-1, FR-2, FR-3, FR-5, FR-6 đạt mức API Ready.
- E2E cơ bản pass cho: tạo nhân viên, reject có lý do, approve đổi fixed schedule, promote.

## Sprint 2 (Tuần 4-5) — Project & Customer Domain
- Hoàn thiện Project CRUD, member management, progress endpoint.
- Hoàn thiện Customer CRUD + project linkage.
- Hoàn thiện Document metadata + storage integration.
- Hoàn thiện Revenue CRUD.

**Mốc nghiệm thu Sprint 2**
- FR-4 full API Ready.
- Tất cả migration và index quan trọng đã có (`projects.code`, schedule/daily index).

## Sprint 3 (Tuần 6-8) — Hardening, UAT, Release
- Hoàn thiện audit log bao phủ action nhạy cảm.
- Tối ưu query summary theo ngày, phân trang danh sách lớn.
- Security hardening, permission test, data-scope test.
- UAT theo kịch bản mục 12 SAD, fix bug, chuẩn bị release.

**Mốc nghiệm thu Sprint 3**
- P95 API list/summarize đạt mục tiêu (tham chiếu SAD 11.2).
- UAT pass cho các kịch bản UAT-01..04.
- Release candidate sẵn sàng deploy.

## 6) Work breakdown chi tiết theo developer

## 6.1 `datlt`
- W1: Project bootstrap, auth module skeleton, thiết lập Prisma schema + migration baseline.
- W2: Employee CRUD + filter/search + soft delete + validations.
- W3: Position CRUD + referential guard; JobTitle CRUD.
- W4: Promotion flow + employee timeline/history + audit.
- W5-W6: RBAC/data-scope hardening, integration hỗ trợ team.
- W7-W8: Bug fixing + performance tuning + release support.

## 6.2 `anhlt`
- W1: Chi tiết hóa conflict matrix cho schedule request.
- W2: Queue PENDING + filter + approve/reject API.
- W3: Daily summary + drill-down + change fixed schedule flow.
- W4: Daily report query APIs + pagination/filter.
- W5-W6: E2E cho schedule/daily + tuning query/index.
- W7-W8: UAT fixes + permission/data isolation validation.

## 6.3 `phucth`
- W1: Thiết kế model Prisma cho Project/Customer/Document/Revenue.
- W2: Project CRUD + project members.
- W3: Customer CRUD + project-customer linkage.
- W4: Document APIs + storage adapter.
- W5: Revenue CRUD + validation.
- W6: Project daily progress endpoint + tests.
- W7-W8: UAT fixes + optimize joins/query plan.

## 7) Cơ chế phối hợp và kiểm soát chất lượng

- Branching: `main` (protected), `develop` (integration), feature branch theo format `feature/<module>-<owner>`.
- PR rule:
  - Tối thiểu 1 reviewer.
  - Bắt buộc pass lint + test + build.
  - Có checklist: migration, permission, audit, test case.
- API contract-first:
  - Mỗi module phải publish OpenAPI spec.
  - Thay đổi breaking phải có version/changelog.
- DB governance:
  - Migration review chéo giữa 2 dev.
  - Không merge nếu thiếu index cho query list/summarize lớn.

## 8) Definition of Done (DoD)

Một user story được xem là hoàn thành khi:

1. Code đã merge vào `develop`, pass CI.
2. Có cập nhật `prisma/schema.prisma` và migration PostgreSQL hợp lệ qua Prisma (nếu tác động schema).
3. Có test phù hợp (unit/integration/e2e theo mức độ).
4. Endpoint có kiểm soát RBAC + data-scope.
5. Có audit log cho action nhạy cảm.
6. Cập nhật API docs + changelog module.

## 9) Rủi ro chính và phương án giảm thiểu

- Rủi ro policy request chưa chốt -> khóa quyết định tại Sprint 0, có biên bản rule.
- Rủi ro rework quan hệ customer-project -> chốt sớm, migration strategy rõ ràng.
- Rủi ro chậm do phụ thuộc chéo module -> dùng mock interface và API contract ngay từ W2.
- Rủi ro hiệu năng summary -> tạo index sớm, benchmark từ Sprint 1.
- Rủi ro lỗi phân quyền -> viết test matrix theo role + data-scope trước UAT.

## 10) Deliverables cuối kỳ

- Source code backend Node.js + TypeScript theo module domain.
- Bộ `prisma/schema.prisma` và migration PostgreSQL đầy đủ.
- OpenAPI docs cho toàn bộ endpoint.
- Bộ test + báo cáo coverage trọng yếu.
- UAT checklist và biên bản pass/fail theo từng FR.
