# anhlt - Schedule Request Queue & Approval (FR-2)

## Module
- Schedule & Approval

## Tasks
- [x] `ANH-SRQ-001` (P0, SP1) Tao DTO filter queue (status/type/employee/date range).
- [x] `ANH-SRQ-002` (P0, SP2) Implement `GET /api/schedule-requests` cho queue PENDING + pagination.
- [x] `ANH-SRQ-003` (P0, SP2) Implement `POST /api/schedule-requests/{id}/approve`.
- [x] `ANH-SRQ-004` (P0, SP2) Implement `POST /api/schedule-requests/{id}/reject` + validate rejectionReason bat buoc.
- [x] `ANH-SRQ-005` (P0, SP3) Enforce conflict rule theo policy da chot (full-day vs half-day, pending uniqueness).
- [x] `ANH-SRQ-006` (P0, SP2) Xu ly approval `CHANGE_FIXED_SCHEDULE` cap nhat `employees.fixed_schedule` + transaction.
- [x] `ANH-SRQ-007` (P1, SP2) Them audit payload cho approve/reject action.
- [x] `ANH-SRQ-008` (P1, SP2) Them idempotency check tranh approve/reject lai request da xu ly.
- [x] `ANH-SRQ-009` (P1, SP2) Integration test approve/reject/change fixed schedule.

## Dependencies
- Employee module + Auth guard.

## Done criteria
- Dap ung FR-2.3..2.5.
