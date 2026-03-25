# TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG (SAD)

## 1) Tổng quan

### 1.1 Mục tiêu
- Xây dựng ứng dụng web quản lý nhân sự cho vai trò quản lý/quản trị (Manager/Admin).
- Tập trung vào quản trị nhân viên, lịch làm việc và phê duyệt yêu cầu, daily report, dự án, khách hàng, vị trí và chức vụ/thăng tiến.
- Đảm bảo dữ liệu minh bạch, truy vết được thay đổi, hỗ trợ vận hành và ra quyết định.

### 1.2 Phạm vi
- **Trong phạm vi**: các module FR-1 đến FR-6 trong tài liệu `docs/project.md`.
- **Ngoài phạm vi**: giao diện chi tiết cho nhân viên (employee self-service), payroll, chấm công tự động, tích hợp ERP/accounting.

### 1.3 Đối tượng sử dụng
- `QuanTriVien` (Admin): toàn quyền cấu hình dữ liệu danh mục, người dùng, phân quyền.
- `QuanLy` (Manager): quản lý nhân viên thuộc phạm vi phụ trách, duyệt yêu cầu lịch, theo dõi daily/progress, quản lý dự án liên quan.

### 1.4 Thuật ngữ chính
- Position: vị trí công việc (Backend Dev, QA...)
- Job Title: chức vụ/cấp bậc (Junior, Senior, Lead...)
- Fixed Working Schedule: `8:00-17:00` hoặc `9:00-18:00`
- Schedule Request: yêu cầu nghỉ/remote/nửa buổi/đổi lịch cố định

## 2) Giả định nghiệp vụ và ràng buộc

### 2.1 Giả định
- Mỗi nhân viên có đúng 1 lịch làm việc cố định tại một thời điểm.
- Một nhân viên có thể thuộc nhiều dự án đồng thời.
- Daily report là bản ghi theo ngày, theo nhân viên, và có thể gắn dự án.
- Chức vụ hiện tại của nhân viên lấy từ bản ghi hiệu lực mới nhất trong lịch sử thăng tiến.

### 2.2 Ràng buộc nghiệp vụ bắt buộc
- Không cho phép hard delete nhân viên nếu còn dữ liệu liên quan (request, daily, project membership...).
- Position không được xóa nếu còn nhân viên đang tham chiếu.
- Từ chối yêu cầu lịch bắt buộc có lý do.
- Lịch cố định chỉ nhận giá trị `SHIFT_8_5` hoặc `SHIFT_9_6`.
- Yêu cầu cùng ngày phải kiểm tra xung đột logic (ví dụ vừa nghỉ sáng vừa remote sáng).

## 3) Yêu cầu chức năng chi tiết theo module

## 3.1 Module Quản lý nhân viên (FR-1.x)

### Chức năng
- Danh sách nhân viên: tìm kiếm theo từ khóa và lọc theo phòng ban/dự án/position/job title/trạng thái.
- CRUD nhân viên: tạo, sửa, xem chi tiết, soft delete/ngưng sử dụng.
- Quản lý gán dự án: hỗ trợ 1-n hoặc n-n qua bảng trung gian.

### Dữ liệu chính
- Bắt buộc: Họ tên, DOB, nơi ở, position, phòng ban, fixed schedule.
- Tùy chọn: nhiều dự án, metadata (createdAt, createdBy, updatedAt, updatedBy).

### Quy tắc validate
- DOB không được lớn hơn ngày hiện tại và phải đạt ngưỡng tuổi lao động (ví dụ >= 18, cấu hình được).
- Position, phòng ban, fixed schedule bắt buộc.
- Họ tên không rỗng, chuẩn hóa khoảng trắng.

## 3.2 Module Lịch làm việc & phê duyệt yêu cầu (FR-2.x)

### Chức năng
- Lịch tổng hợp theo ngày trong khoảng chọn: hiển thị số lượng theo loại trạng thái (off/remote/half-day).
- Drill-down khi click ô ngày/chỉ số: hiển thị danh sách nhân viên theo từng loại.
- Hàng đợi chờ duyệt: lọc theo loại yêu cầu, nhân viên, khoảng ngày.
- Duyệt/Từ chối yêu cầu; ghi nhận audit đầy đủ.
- Duyệt đổi lịch cố định: khi duyệt cập nhật hồ sơ nhân viên.

### Loại yêu cầu
- OFF_FULL_DAY, REMOTE_FULL_DAY
- OFF_AM, OFF_PM
- REMOTE_AM, REMOTE_PM
- CHANGE_FIXED_SCHEDULE

### Quy tắc xử lý xung đột (đề xuất)
- Mỗi nhân viên mỗi ngày tối đa 1 request ở trạng thái `PENDING`.
- Nếu đã có `APPROVED` full day thì chặn thêm yêu cầu nửa buổi cùng ngày.
- Cặp AM/PM khác loại (off sáng + remote chiều) được phép nếu policy công ty cho phép (cấu hình).

## 3.3 Module Daily report (FR-3.x)

### Chức năng
- Quản lý xem daily theo từng nhân viên (dạng bảng hoặc timeline).
- Lọc theo khoảng ngày và dự án.
- Đảm bảo chỉ hiển thị dữ liệu thuộc nhân viên đang chọn.

### Cấu trúc record
- reportDate, employeeId, projectId (nullable), taskSummary, workContent, createdAt.

### Quy tắc
- Mỗi nhân viên tối đa 1 bản ghi daily/ngày/dự án (hoặc 1 bản ghi/ngày nếu không phân mảnh theo dự án; chọn 1 cách khi triển khai).

## 3.4 Module Dự án & Khách hàng (FR-4.x)

### Chức năng dự án
- CRUD dự án, trạng thái: RUNNING/PAUSED/ENDED.
- Quản lý thành viên dự án: thêm/gỡ, tùy chọn vai trò trong dự án.
- Xem tiến độ theo ngày từ daily của thành viên.
- Quản lý tài liệu dự án: upload/list/download/delete theo quyền.
- Quản lý doanh thu dự án theo kỳ và phân loại dự kiến/thực tế.

### Chức năng khách hàng
- CRUD thông tin khách hàng theo bộ trường trong tài liệu yêu cầu.
- Liên kết khách hàng-dự án theo mô hình 1-n hoặc n-n.

### Quy tắc đề xuất
- Nếu dùng mô hình n-n, một dự án có thể có nhiều khách hàng phụ trách giai đoạn khác nhau.
- Tài liệu dự án lưu metadata và đường dẫn object storage.

## 3.5 Module Position (FR-5.x)

### Chức năng
- CRUD position: tên, mô tả, trạng thái.
- Chặn xóa khi đang được tham chiếu bởi employee.
- Cập nhật position của nhân viên từ profile hoặc hàng loạt.

### Audit
- Lưu lịch sử thay đổi position: oldValue, newValue, changedBy, changedAt, reason.

## 3.6 Module Job Title & Promotion (FR-6.x)

### Chức năng
- CRUD chức vụ với thứ tự cấp (`levelOrder`).
- Promote nhân viên với ngày hiệu lực, ghi chú.
- Xem lịch sử thăng tiến và timeline trên profile nhân viên.

### Quy tắc promote
- Nếu bật policy strict: chỉ cho phép promote tới cấp cao hơn (`newLevelOrder > currentLevelOrder`).
- Không cho phép 2 bản ghi promotion cùng `effectiveDate` cho cùng nhân viên.

## 4) Use case nghiệp vụ

### UC-01: Tạo mới nhân viên
- Actor: Admin/Manager
- Tiền điều kiện: Có danh mục position, department.
- Luồng chính:
  1. Mở màn hình tạo nhân viên.
  2. Nhập thông tin bắt buộc, chọn fixed schedule.
  3. Lưu dữ liệu.
  4. Hệ thống validate và tạo bản ghi employee.
- Hậu điều kiện: nhân viên xuất hiện trong danh sách.

### UC-02: Duyệt yêu cầu nghỉ/remote
- Actor: Manager
- Tiền điều kiện: Có request trạng thái PENDING.
- Luồng chính:
  1. Mở hàng đợi duyệt.
  2. Chọn request.
  3. Nhấn Duyệt hoặc Từ chối (kèm lý do nếu từ chối).
  4. Hệ thống cập nhật trạng thái + audit.
  5. Lịch tổng hợp cập nhật số đếm.
- Hậu điều kiện: request chuyển APPROVED/REJECTED.

### UC-03: Promote nhân viên
- Actor: Admin/Manager được phân quyền
- Tiền điều kiện: Có job title mục tiêu hợp lệ.
- Luồng chính: chọn nhân viên -> chọn chức vụ mới -> nhập ngày hiệu lực -> lưu.
- Hậu điều kiện: thêm bản ghi title history; profile hiển thị chức vụ hiện tại mới.

## 5) Thiết kế kiến trúc hệ thống

### 5.1 Kiến trúc tổng thể (đề xuất)
- Kiểu kiến trúc: 3 lớp hoặc modular monolith (UI + API + DB).
- Frontend: SPA (React/Vue/Angular đều phù hợp).
- Backend: RESTful API, tách module theo domain.
- Database: PostgreSQL/MySQL (quan hệ).
- File storage: S3-compatible/Azure Blob cho tài liệu dự án.
- Cache (tùy chọn): Redis cho thống kê lịch theo ngày và session.

### 5.2 Domain modules
- Identity & Access Control
- Employee Management
- Schedule & Approval
- Daily Report
- Project & Customer
- Position
- Job Title & Promotion
- Audit Log

## 6) Thiết kế dữ liệu logic

## 6.1 Danh sách thực thể chính
- employees
- departments
- positions
- job_titles
- employee_title_histories
- projects
- project_members
- customers
- project_customers (n-n, nếu áp dụng)
- daily_reports
- schedule_requests
- project_documents
- project_revenues
- audit_logs

## 6.2 Lược đồ bảng đề xuất (rút gọn)

### Bảng `employees`
- id (PK)
- full_name
- dob
- address
- department_id (FK)
- position_id (FK)
- fixed_schedule ENUM(`SHIFT_8_5`,`SHIFT_9_6`)
- employment_status ENUM(`ACTIVE`,`INACTIVE`)
- created_at, created_by, updated_at, updated_by, deleted_at (soft delete)

### Bảng `schedule_requests`
- id (PK)
- employee_id (FK)
- request_type ENUM(...)
- request_date
- requested_schedule ENUM(`SHIFT_8_5`,`SHIFT_9_6`) NULL (dùng cho đổi lịch cố định)
- status ENUM(`PENDING`,`APPROVED`,`REJECTED`,`CANCELLED`)
- reason
- rejection_reason
- approved_by, approved_at
- created_at

### Bảng `daily_reports`
- id (PK)
- employee_id (FK)
- report_date
- project_id (FK, nullable)
- task
- work_content
- created_at, updated_at

### Bảng `projects`
- id (PK)
- code (unique)
- name
- status ENUM(`RUNNING`,`PAUSED`,`ENDED`)
- start_date, end_date
- description
- created_at, updated_at

### Bảng `project_members`
- id (PK)
- project_id (FK)
- employee_id (FK)
- role_in_project
- joined_at, left_at

### Bảng `customers`
- id (PK)
- company_name
- tax_code
- business_address
- contact_address
- country
- city
- contact_name
- contact_title
- contact_email
- contact_phone
- payment_terms
- notes
- cooperation_status

### Bảng `project_documents`
- id (PK)
- project_id (FK)
- file_name
- storage_key
- mime_type
- size_bytes
- uploaded_by
- uploaded_at

### Bảng `project_revenues`
- id (PK)
- project_id (FK)
- period_month
- period_year
- revenue_type ENUM(`FORECAST`,`ACTUAL`)
- amount DECIMAL(18,2)
- currency
- note

### Bảng `job_titles`
- id (PK)
- name
- level_order
- description
- active

### Bảng `employee_title_histories`
- id (PK)
- employee_id (FK)
- old_job_title_id (FK)
- new_job_title_id (FK)
- effective_date
- reason
- created_by
- created_at

### Bảng `audit_logs`
- id (PK)
- actor_id
- actor_role
- action
- entity_type
- entity_id
- old_data JSON
- new_data JSON
- created_at

## 6.3 Chỉ mục và ràng buộc quan trọng
- Unique: `projects.code`, (option) `daily_reports(employee_id, report_date, project_id)`.
- Index: `schedule_requests(request_date, status)`, `daily_reports(employee_id, report_date)`, `employees(department_id, position_id)`.
- Foreign key có rule `RESTRICT` với delete các danh mục đang được tham chiếu.

## 7) Thiết kế API (REST) mức nghiệp vụ

## 7.1 Employee
- `GET /api/employees?keyword=&departmentId=&projectId=&positionId=&jobTitleId=&status=&page=&size=`
- `POST /api/employees`
- `GET /api/employees/{id}`
- `PUT /api/employees/{id}`
- `DELETE /api/employees/{id}` (soft delete)

## 7.2 Schedule request
- `GET /api/schedule-requests?status=PENDING&type=&employeeId=&from=&to=`
- `POST /api/schedule-requests/{id}/approve`
- `POST /api/schedule-requests/{id}/reject`
- `GET /api/schedules/daily-summary?from=&to=&departmentId=&projectId=`
- `GET /api/schedules/daily-drilldown?date=&type=`

## 7.3 Daily report
- `GET /api/daily-reports?employeeId=&projectId=&from=&to=&page=&size=`
- `GET /api/projects/{projectId}/daily-progress?memberId=&from=&to=`

## 7.4 Project & customer
- `GET/POST/PUT/DELETE /api/projects`
- `POST /api/projects/{id}/members`
- `DELETE /api/projects/{id}/members/{employeeId}`
- `GET/POST/PUT/DELETE /api/customers`
- `POST /api/projects/{id}/documents` (upload)
- `GET /api/projects/{id}/documents`
- `DELETE /api/projects/{id}/documents/{docId}`
- `GET/POST/PUT/DELETE /api/projects/{id}/revenues`

## 7.5 Position / Job title / Promotion
- `GET/POST/PUT/DELETE /api/positions`
- `GET/POST/PUT/DELETE /api/job-titles`
- `POST /api/employees/{id}/promotions`
- `GET /api/employees/{id}/promotions`

## 8) Thiết kế phân quyền

### Ma trận quyền (rút gọn)
- Admin: toàn quyền CRUD + duyệt + cấu hình danh mục + xem audit.
- Manager: CRUD giới hạn theo phạm vi quản lý; duyệt request trong team; xem daily/progress của team.

### Nguyên tắc kiểm soát truy cập
- RBAC kết hợp data-scope (theo phòng ban/team/project).
- API phải kiểm tra quyền theo từng endpoint và từng bản ghi.

## 9) Luồng nghiệp vụ quan trọng

### 9.1 Luồng duyệt đổi lịch cố định
1. Employee gửi request `CHANGE_FIXED_SCHEDULE`.
2. Request vào trạng thái `PENDING`.
3. Manager duyệt `APPROVED`.
4. Hệ thống cập nhật `employees.fixed_schedule`.
5. Ghi `audit_logs` với old/new value.

### 9.2 Luồng promote
1. Manager chọn nhân viên và chức vụ mới.
2. Hệ thống kiểm tra policy `level_order`.
3. Ghi `employee_title_histories`.
4. Cập nhật chức vụ hiện tại của nhân viên (hoặc tính từ bản ghi mới nhất).
5. Timeline nhân viên hiển thị sự kiện mới.

## 10) Thiết kế UI/UX mức màn hình

## 10.1 Danh sách nhân viên
- Bộ lọc trái/phía trên, bảng phân trang, quick action (xem/sửa/ngưng sử dụng).
- Cột gợi ý: Họ tên, DOB, phòng ban, position, job title hiện tại, fixed schedule, trạng thái.

## 10.2 Lịch tổng hợp yêu cầu
- Calendar hoặc heatmap theo ngày.
- Mỗi ô ngày có chips số lượng theo loại (off/remote/half-day).
- Click chip mở drawer/popup drill-down danh sách nhân viên.

## 10.3 Queue phê duyệt
- Bảng PENDING, filter nâng cao.
- Action nhanh Duyệt/Từ chối, bắt buộc nhập lý do khi từ chối.

## 10.4 Chi tiết nhân viên
- Tab: Thông tin chung | Dự án | Daily | Lịch sử chức vụ (timeline) | Lịch sử thay đổi.

## 10.5 Quản lý dự án
- Danh sách dự án, màn hình chi tiết gồm thành viên, tài liệu, khách hàng, doanh thu, tiến độ theo ngày.

## 11) Yêu cầu phi chức năng chi tiết

### 11.1 Bảo mật
- Xác thực JWT/OAuth2 hoặc session tùy hạ tầng.
- Mật khẩu băm mạnh (Argon2/bcrypt) nếu tự quản lý user.
- Audit action nhạy cảm: duyệt request, đổi chức vụ, xóa/ngưng sử dụng.

### 11.2 Hiệu năng
- P95 API danh sách < 500ms với dữ liệu trung bình.
- Phân trang bắt buộc cho danh sách lớn.
- Tối ưu query cho summary theo ngày.

### 11.3 Tính sẵn sàng và sao lưu
- Backup DB hằng ngày, retention tối thiểu 30 ngày.
- Cơ chế restore có kiểm thử định kỳ.

### 11.4 Quan sát hệ thống
- Log chuẩn hóa (request id, actor, action, latency).
- Dashboard theo dõi lỗi 4xx/5xx, độ trễ API.

## 12) Kịch bản kiểm thử chấp nhận (UAT) mẫu

### UAT-01 Nhân viên
- Tạo nhân viên mới với fixed schedule hợp lệ -> thành công.
- Tạo với fixed schedule ngoài 2 giá trị -> thất bại, báo lỗi rõ ràng.

### UAT-02 Phê duyệt lịch
- Từ chối không nhập lý do -> chặn thao tác.
- Duyệt yêu cầu đổi lịch cố định -> hồ sơ nhân viên đổi đúng.

### UAT-03 Daily
- Chọn nhân viên A, lọc ngày -> không thấy dữ liệu nhân viên B.

### UAT-04 Position/Job Title
- Xóa position đang dùng -> bị chặn.
- Promote sai cấp theo policy strict -> bị chặn.

## 13) Truy vết yêu cầu (Requirement Traceability Matrix)

| Requirement | Module/Thiết kế | API chính | Bảng dữ liệu chính |
|---|---|---|---|
| FR-1.1..1.5 | Employee Management | /api/employees | employees |
| FR-2.1..2.5 | Schedule & Approval | /api/schedule-requests, /api/schedules/* | schedule_requests, employees |
| FR-3.1..3.3 | Daily Report | /api/daily-reports | daily_reports |
| FR-4.1..4.6 | Project & Customer | /api/projects, /api/customers | projects, project_members, project_documents, project_revenues, customers |
| FR-5.1..5.3 | Position | /api/positions | positions, audit_logs |
| FR-6.1..6.4 | Job Title & Promotion | /api/job-titles, /api/employees/{id}/promotions | job_titles, employee_title_histories |

## 14) Rủi ro và khuyến nghị

- Rủi ro xung đột nghiệp vụ request nửa buổi/full-day chưa chốt policy -> cần workshop chốt rule trước khi coding.
- Quan hệ customer-project (1-n vs n-n) ảnh hưởng CSDL và UX -> cần quyết định sớm.
- Daily report hiện dùng text task; nếu tích hợp task system sau này cần chuẩn bị `external_task_id` nullable.
- Khuyến nghị triển khai theo phase:
  - Phase 1: Employee + Schedule/Approval + Position + Job Title.
  - Phase 2: Project + Customer + Document + Revenue.
  - Phase 3: Dashboard báo cáo, tối ưu hiệu năng, mở rộng tích hợp.

## 15) Phụ lục: Trạng thái và enum đề xuất

### `FixedSchedule`
- `SHIFT_8_5`
- `SHIFT_9_6`

### `ScheduleRequestStatus`
- `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`

### `ProjectStatus`
- `RUNNING`, `PAUSED`, `ENDED`

### `RevenueType`
- `FORECAST`, `ACTUAL`

---

**Nguồn đầu vào**: tài liệu yêu cầu tại `docs/project.md` (v1.0).  
**Mục đích tài liệu này**: làm baseline cho thiết kế chi tiết, phân rã backlog, thiết kế API/DB/UI và chuẩn bị UAT.
