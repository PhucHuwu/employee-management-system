# anhlt - Daily Report Query (FR-3)

## Module
- Daily Report

## Tasks
- [x] `ANH-DRP-001` (P0, SP1) Tao DTO filter employeeId/projectId/date range/page/size.
- [x] `ANH-DRP-002` (P0, SP2) Implement `GET /api/daily-reports`.
- [x] `ANH-DRP-003` (P0, SP2) Implement `GET /api/projects/{projectId}/daily-progress?memberId=&from=&to=`.
- [x] `ANH-DRP-004` (P1, SP2) Enforce data isolation: chi thay du lieu employee duoc chon trong scope.
- [x] `ANH-DRP-005` (P1, SP2) Add sorting (reportDate desc mac dinh) + pagination metadata.
- [x] `ANH-DRP-006` (P1, SP2) Integration test filter theo employee/date/project.
- [x] `ANH-DRP-007` (P1, SP2) E2E test truong hop "khong lo du lieu nhan vien khac".

## Dependencies
- Project module endpoint co ban (phucth) cho daily-progress context.

## Done criteria
- Dap ung FR-3.1..3.3.
