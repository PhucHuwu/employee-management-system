import { Prisma, Role } from '@prisma/client'

import type { SeedContext } from '../context'

interface PermissionSeed {
  resource: string
  action: string
  role: Role
  ownership: string
  allowed: boolean
}

const permissionMatrix: PermissionSeed[] = [
  // daily-report
  { resource: 'daily-report', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'daily-report', action: 'create', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'daily-report', action: 'create', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'daily-report', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'daily-report', action: 'read', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'daily-report', action: 'read', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'daily-report', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'daily-report', action: 'update', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'daily-report', action: 'update', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'daily-report', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'daily-report', action: 'delete', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'daily-report', action: 'delete', role: Role.EMPLOYEE, ownership: 'own', allowed: true },

  // schedule-request
  { resource: 'schedule-request', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'schedule-request', action: 'create', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'schedule-request', action: 'create', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'schedule-request', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'schedule-request', action: 'read', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'schedule-request', action: 'read', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'schedule-request', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'schedule-request', action: 'update', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'schedule-request', action: 'update', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'schedule-request', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'schedule-request', action: 'delete', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'schedule-request', action: 'approve', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'schedule-request', action: 'approve', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'schedule-request', action: 'reject', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'schedule-request', action: 'reject', role: Role.MANAGER, ownership: 'scope', allowed: true },

  // project
  { resource: 'project', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'project', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'project', action: 'read', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'project', action: 'read', role: Role.EMPLOYEE, ownership: 'scope', allowed: true },
  { resource: 'project', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'project', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },

  // project-member
  { resource: 'project-member', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'project-member', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },

  // project-revenue
  { resource: 'project-revenue', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'project-revenue', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'project-revenue', action: 'read', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'project-revenue', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'project-revenue', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },

  // project-document
  { resource: 'project-document', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'project-document', action: 'create', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'project-document', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'project-document', action: 'read', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'project-document', action: 'read', role: Role.EMPLOYEE, ownership: 'scope', allowed: true },
  { resource: 'project-document', action: 'download', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'project-document', action: 'download', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'project-document', action: 'download', role: Role.EMPLOYEE, ownership: 'scope', allowed: true },
  { resource: 'project-document', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },

  // employee
  { resource: 'employee', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'employee', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'employee', action: 'read', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'employee', action: 'read', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'employee', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'employee', action: 'update', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'employee', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'employee', action: 'promote', role: Role.ADMIN, ownership: 'any', allowed: true },

  // position
  { resource: 'position', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'position', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'position', action: 'read', role: Role.MANAGER, ownership: 'any', allowed: true },
  { resource: 'position', action: 'read', role: Role.EMPLOYEE, ownership: 'any', allowed: true },
  { resource: 'position', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'position', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },

  // job-title
  { resource: 'job-title', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'job-title', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'job-title', action: 'read', role: Role.MANAGER, ownership: 'any', allowed: true },
  { resource: 'job-title', action: 'read', role: Role.EMPLOYEE, ownership: 'any', allowed: true },
  { resource: 'job-title', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'job-title', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },

  // customer
  { resource: 'customer', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'customer', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'customer', action: 'read', role: Role.MANAGER, ownership: 'any', allowed: true },
  { resource: 'customer', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'customer', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },

  // department
  { resource: 'department', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'department', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'department', action: 'read', role: Role.MANAGER, ownership: 'any', allowed: true },
  { resource: 'department', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'department', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },

  // analytics
  { resource: 'analytics', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'analytics', action: 'read', role: Role.MANAGER, ownership: 'any', allowed: true },

  // audit-log
  { resource: 'audit-log', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },

  // permission
  { resource: 'permission', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'permission', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },

  // manager-scope
  { resource: 'manager-scope', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'manager-scope', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
]

export const seedPermissions = async (ctx: SeedContext): Promise<void> => {
  const { prisma } = ctx

  const data: Prisma.PermissionCreateManyInput[] = permissionMatrix.map((p) => ({
    resource: p.resource,
    action: p.action,
    role: p.role,
    ownership: p.ownership,
    allowed: p.allowed,
  }))

  await prisma.permission.createMany({
    data,
    skipDuplicates: true,
  })
}
