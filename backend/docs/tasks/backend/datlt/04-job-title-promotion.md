# datlt - Job Title & Promotion (FR-6)

## Module
- Job Title
- Promotion / Title History

## Tasks
- [x] `DAT-JOB-001` (P0, SP1) Tao DTO create/update job title + validate `levelOrder`.
- [x] `DAT-JOB-002` (P0, SP2) Implement `GET/POST/PUT/DELETE /api/job-titles`.
- [x] `DAT-PRO-001` (P0, SP2) Implement `POST /api/employees/{id}/promotions`.
- [x] `DAT-PRO-002` (P0, SP2) Implement `GET /api/employees/{id}/promotions` (timeline).
- [x] `DAT-PRO-003` (P0, SP2) Enforce unique `(employeeId, effectiveDate)` nhu SAD.
- [x] `DAT-PRO-004` (P1, SP2) Implement strict policy check `newLevelOrder > currentLevelOrder` (feature flag).
- [x] `DAT-PRO-005` (P1, SP2) Dong bo chuc vu hien tai employee (hoac tinh toan tu history theo quyet dinh).
- [x] `DAT-PRO-006` (P1, SP2) Audit log cho promotion event (actor, old/new title, reason).
- [x] `DAT-PRO-007` (P1, SP3) E2E: promote dung/sai policy, duplicate effectiveDate.

## Dependencies
- Co du lieu employee + job title.

## Done criteria
- Dap ung FR-6.1..6.4 va policy trong SAD.
