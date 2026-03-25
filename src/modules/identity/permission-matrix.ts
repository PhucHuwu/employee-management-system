import { Role } from '@prisma/client';

export interface PermissionMatrixItem {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  roles: Role[];
  notes?: string;
}

export const PERMISSION_MATRIX: PermissionMatrixItem[] = [
  { method: 'GET', path: '/api/health', roles: [Role.ADMIN, Role.MANAGER], notes: 'Public route via @Public' },
  { method: 'POST', path: '/api/auth/login', roles: [Role.ADMIN, Role.MANAGER], notes: 'Public route for authentication' },

  { method: 'GET', path: '/api/schedule-requests', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'POST', path: '/api/schedule-requests/:id/approve', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'POST', path: '/api/schedule-requests/:id/reject', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'GET', path: '/api/schedules/daily-summary', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'GET', path: '/api/schedules/daily-drilldown', roles: [Role.ADMIN, Role.MANAGER] },

  { method: 'GET', path: '/api/daily-reports', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'GET', path: '/api/projects/:projectId/daily-progress', roles: [Role.ADMIN, Role.MANAGER] },

  { method: 'POST', path: '/api/projects', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'GET', path: '/api/projects', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'GET', path: '/api/projects/:id', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'PUT', path: '/api/projects/:id', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'DELETE', path: '/api/projects/:id', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'POST', path: '/api/projects/:id/members', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'DELETE', path: '/api/projects/:id/members/:employeeId', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'GET', path: '/api/projects/:id/revenues', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'POST', path: '/api/projects/:id/revenues', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'PUT', path: '/api/projects/:id/revenues/:revenueId', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'DELETE', path: '/api/projects/:id/revenues/:revenueId', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'POST', path: '/api/projects/:id/documents', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'GET', path: '/api/projects/:id/documents', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'GET', path: '/api/projects/:id/documents/:docId/download', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'DELETE', path: '/api/projects/:id/documents/:docId', roles: [Role.ADMIN, Role.MANAGER] },

  { method: 'GET', path: '/api/customers', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'POST', path: '/api/customers', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'GET', path: '/api/customers/:id', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'PUT', path: '/api/customers/:id', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'DELETE', path: '/api/customers/:id', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'POST', path: '/api/projects/:id/customers', roles: [Role.ADMIN, Role.MANAGER] },
  { method: 'DELETE', path: '/api/projects/:id/customers/:customerId', roles: [Role.ADMIN, Role.MANAGER] },
];
