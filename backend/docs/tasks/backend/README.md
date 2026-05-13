# BACKEND TASK BOARD (CHI TIẾT THEO DEV)

Nguồn tham chiếu:
- `docs/project.md`
- `docs/system-analysis-design.md`
- `docs/development-plan-3dev.md`

Mục tiêu:
- Chia nhỏ task theo module để 3 backend dev (`datlt`, `anhlt`, `phucth`) có thể làm song song.
- Mỗi task có ID, đầu ra rõ ràng, phụ thuộc, ưu tiên và tiêu chí hoàn thành.

## Cấu trúc thư mục
- `docs/tasks/backend/datlt/`
- `docs/tasks/backend/anhlt/`
- `docs/tasks/backend/phucth/`

## Quy ước chung
- Trạng thái task: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.
- Ưu tiên: `P0` (cao nhất), `P1`, `P2`.
- Story point (SP): 1, 2, 3, 5.
- Mỗi PR nên map tới ít nhất 1 task ID.

## Phân bổ chính
- `datlt`: Foundation, Auth/RBAC/Data-scope, Employee, Position, JobTitle/Promotion, Audit core.
- `anhlt`: Schedule Request, Approval flow, Daily summary/drill-down, Daily Report.
- `phucth`: Project, Member, Customer link, Document, Revenue.
