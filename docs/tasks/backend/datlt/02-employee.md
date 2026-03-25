# datlt - Employee Module (FR-1)

## Module
- Employee Management

## Tasks
- [x] `DAT-EMP-001` (P0, SP1) Define DTO create/update employee + validate DOB, required fields, fixed schedule enum.
- [x] `DAT-EMP-002` (P0, SP2) Implement `POST /api/employees` (create employee).
- [x] `DAT-EMP-003` (P0, SP2) Implement `GET /api/employees/{id}` (detail + metadata).
- [x] `DAT-EMP-004` (P0, SP3) Implement `GET /api/employees` voi filter keyword/department/project/position/jobTitle/status + pagination.
- [x] `DAT-EMP-005` (P0, SP2) Implement `PUT /api/employees/{id}` + ghi old/new cho audit payload.
- [x] `DAT-EMP-006` (P0, SP2) Implement `DELETE /api/employees/{id}` theo soft delete.
- [x] `DAT-EMP-007` (P1, SP2) Chan hard delete khi con rang buoc (request/daily/project membership).
- [x] `DAT-EMP-008` (P1, SP2) Them normalizer fullName (trim, collapse spaces).
- [x] `DAT-EMP-009` (P1, SP2) Them integration test cho list/filter/pagination.
- [x] `DAT-EMP-010` (P1, SP2) Them e2e test tao/sua/xoa mem employee.

## Dependencies
- Su dung guard auth/rbac da co (`DAT-AUTH-*`).
- Audit service base tu file 05.

## Done criteria
- Dap ung FR-1.1..1.5 o muc API Ready.
- Test quan trong pass.
