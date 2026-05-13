# phucth - Test Matrix FR-4.1..4.6

## Muc tieu
- Bao phu regression test toi thieu cho toan bo FR-4 (Project/Member/Customer/Document/Revenue).

## Ma tran test

| Requirement | API/Flow | Test case | Test type | Trang thai |
|---|---|---|---|---|
| FR-4.1 | Project CRUD | Tao, list phan trang, xem chi tiet, cap nhat, xoa du an | Integration (`project.integration.spec.ts`) | Done |
| FR-4.1 | Project unique code | Tao du an trung `code` bi chan | Integration | Done |
| FR-4.2 | Project members | Them member, xoa member | Integration | Done |
| FR-4.2 | Member duplicate | Them trung `(projectId, employeeId)` bi chan | Integration | Done |
| FR-4.3 | Daily progress by project | Query theo project/member/date range | Integration | Done |
| FR-4.4 | Document flow | Upload -> list -> download -> delete | Integration | Done |
| FR-4.5 | Customer CRUD | Tao, list, cap nhat, xoa customer | Integration | Done |
| FR-4.5 | Project-customer linkage | Link/unlink customer voi project | Integration | Done |
| FR-4.5 | Duplicate link | Link trung `(projectId, customerId)` bi chan | Integration | Done |
| FR-4.6 | Revenue CRUD | Tao, list, cap nhat, xoa revenue theo project | Integration | Done |
| FR-4.x | Data-scope | Manager chi duoc truy cap project trong scope | Guard spec (`project.controller-scope.spec.ts`) | Done |

## Ghi chu
- Postman collection da bo sung folder FR-4 de smoke test local.
- Chua co full e2e HTTP + DB that; hien tai uu tien integration/service-level + guard-level cho regression nhanh.
