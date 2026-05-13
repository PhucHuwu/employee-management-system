const { PrismaClient, Role } = require('@prisma/client');
const prisma = new PrismaClient();

const newPermissions = [
  // timesheet-entry
  { resource: 'timesheet-entry', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'timesheet-entry', action: 'create', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'timesheet-entry', action: 'create', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'timesheet-entry', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'timesheet-entry', action: 'read', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'timesheet-entry', action: 'read', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'timesheet-entry', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'timesheet-entry', action: 'update', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'timesheet-entry', action: 'update', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'timesheet-entry', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'timesheet-entry', action: 'delete', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'timesheet-entry', action: 'delete', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'timesheet-entry', action: 'submit', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'timesheet-entry', action: 'submit', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'timesheet-entry', action: 'submit', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'timesheet-entry', action: 'approve', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'timesheet-entry', action: 'approve', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'timesheet-entry', action: 'reject', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'timesheet-entry', action: 'reject', role: Role.MANAGER, ownership: 'scope', allowed: true },

  // working-time-request
  { resource: 'working-time-request', action: 'create', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'working-time-request', action: 'create', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'working-time-request', action: 'create', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'working-time-request', action: 'read', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'working-time-request', action: 'read', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'working-time-request', action: 'read', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'working-time-request', action: 'update', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'working-time-request', action: 'update', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'working-time-request', action: 'update', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'working-time-request', action: 'delete', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'working-time-request', action: 'delete', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'working-time-request', action: 'delete', role: Role.EMPLOYEE, ownership: 'own', allowed: true },
  { resource: 'working-time-request', action: 'approve', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'working-time-request', action: 'approve', role: Role.MANAGER, ownership: 'scope', allowed: true },
  { resource: 'working-time-request', action: 'reject', role: Role.ADMIN, ownership: 'any', allowed: true },
  { resource: 'working-time-request', action: 'reject', role: Role.MANAGER, ownership: 'scope', allowed: true },
];

async function main() {
  for (const p of newPermissions) {
    await prisma.permission.upsert({
      where: {
        resource_action_role_ownership: {
          resource: p.resource,
          action: p.action,
          role: p.role,
          ownership: p.ownership,
        },
      },
      update: {},
      create: p,
    });
  }
  console.log('Inserted', newPermissions.length, 'permissions');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e: Error) => { console.error(e); prisma.$disconnect(); process.exit(1); });
