import { Role } from '@prisma/client'
import { hash } from 'bcrypt'

import type { SeedContext } from '../context'

export const seedUserAccounts = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.users.admin,
      email: 'admin@ems.local',
      passwordHash: await hash('admin123', 10),
      role: Role.ADMIN,
      active: true,
      departmentScopeId: null,
      projectScopeIds: [] as string[],
    },
    {
      id: ids.users.managerEngineering,
      email: 'manager.engineering@ems.local',
      passwordHash: await hash('manager123', 10),
      role: Role.MANAGER,
      active: true,
      departmentScopeId: ids.departments.engineering,
      projectScopeIds: [ids.projects.emsCore, ids.projects.mobileApp],
    },
    {
      id: ids.users.managerBusiness,
      email: 'manager.business@ems.local',
      passwordHash: await hash('manager123', 10),
      role: Role.MANAGER,
      active: true,
      departmentScopeId: ids.departments.business,
      projectScopeIds: [ids.projects.dataHub],
    },
  ]

  for (const item of items) {
    await prisma.userAccount.upsert({
      where: { email: item.email },
      update: {
        passwordHash: item.passwordHash,
        role: item.role,
        active: item.active,
        departmentScopeId: item.departmentScopeId,
        projectScopeIds: item.projectScopeIds,
      },
      create: item,
    })
  }
}

