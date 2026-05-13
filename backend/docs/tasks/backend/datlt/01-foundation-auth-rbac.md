# datlt - Foundation + Auth/RBAC/Data-scope

## Module
- Identity & Access Control
- App foundation

## Tasks
- [x] `DAT-FOUND-001` (P0, SP1) Tao `ConfigService` wrappers cho env quan trong (`PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`).
- [x] `DAT-FOUND-002` (P0, SP2) Thiet lap global exception filter + response format chung (ma loi, message, requestId).
- [x] `DAT-FOUND-003` (P1, SP2) Them request-id middleware va structured logging context.
- [x] `DAT-AUTH-001` (P0, SP2) Tao entity/model user account + role (`ADMIN`, `MANAGER`) va migration Prisma neu can. (Da tao migration SQL va seed mock account local)
- [x] `DAT-AUTH-002` (P0, SP2) Implement `POST /api/auth/login` (mock account local giai doan dau).
- [x] `DAT-AUTH-003` (P0, SP2) Implement JWT strategy + `AuthGuard`.
- [x] `DAT-AUTH-004` (P0, SP2) Implement `RolesGuard` + decorator `@Roles(...)`.
- [x] `DAT-AUTH-005` (P0, SP3) Implement data-scope guard (department/project scope) cho Manager.
- [x] `DAT-AUTH-006` (P1, SP2) Tao matrix permission cho endpoint da co (doc ghi theo role).
- [x] `DAT-AUTH-007` (P1, SP2) Viet test cho AuthGuard/RolesGuard/data-scope guard.

## Dependencies
- Can thong nhat quy tac data-scope tu Sprint 0.

## Done criteria
- Login lay duoc token, endpoint protected dung role + scope.
- Co test co ban cho auth + guard.
