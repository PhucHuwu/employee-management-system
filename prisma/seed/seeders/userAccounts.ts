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
      scopeEmployeeIds: [] as string[],
    },
    {
      id: ids.users.managerEngineering,
      email: 'manager.engineering@ems.local',
      passwordHash: await hash('manager123', 10),
      role: Role.MANAGER,
      active: true,
      departmentScopeId: ids.departments.engineering,
      projectScopeIds: [ids.projects.emsCore, ids.projects.mobileApp],
      scopeEmployeeIds: [] as string[],
    },
    {
      id: ids.users.managerBusiness,
      email: 'manager.business@ems.local',
      passwordHash: await hash('manager123', 10),
      role: Role.MANAGER,
      active: true,
      departmentScopeId: ids.departments.business,
      projectScopeIds: [ids.projects.dataHub],
      scopeEmployeeIds: [] as string[],
    },
    {
      id: ids.users.employeeNguyenAn,
      email: 'nguyen.an@ems.local',
      passwordHash: await hash('employee123', 10),
      role: Role.EMPLOYEE,
      active: true,
      departmentScopeId: null,
      projectScopeIds: [] as string[],
      scopeEmployeeIds: [] as string[],
      employeeId: ids.employees.nguyenAn,
    },
    {
      id: ids.users.employeeTranBinh,
      email: 'tran.binh@ems.local',
      passwordHash: await hash('employee123', 10),
      role: Role.EMPLOYEE,
      active: true,
      departmentScopeId: null,
      projectScopeIds: [] as string[],
      scopeEmployeeIds: [] as string[],
      employeeId: ids.employees.tranBinh,
    },
    {
      id: ids.users.employeeLeCuong,
      email: 'le.cuong@ems.local',
      passwordHash: await hash('employee123', 10),
      role: Role.EMPLOYEE,
      active: true,
      departmentScopeId: null,
      projectScopeIds: [] as string[],
      scopeEmployeeIds: [] as string[],
      employeeId: ids.employees.leCuong,
    },
    {
      id: ids.users.employeePhamDung,
      email: 'pham.dung@ems.local',
      passwordHash: await hash('employee123', 10),
      role: Role.EMPLOYEE,
      active: true,
      departmentScopeId: null,
      projectScopeIds: [] as string[],
      scopeEmployeeIds: [] as string[],
      employeeId: ids.employees.phamDung,
    },
    {
      id: ids.users.employeeHoangEm,
      email: 'hoang.em@ems.local',
      passwordHash: await hash('employee123', 10),
      role: Role.EMPLOYEE,
      active: true,
      departmentScopeId: null,
      projectScopeIds: [] as string[],
      scopeEmployeeIds: [] as string[],
      employeeId: ids.employees.hoangEm,
    },
    {
      id: ids.users.employeeNgoPhuong,
      email: 'ngo.phuong@ems.local',
      passwordHash: await hash('employee123', 10),
      role: Role.EMPLOYEE,
      active: true,
      departmentScopeId: null,
      projectScopeIds: [] as string[],
      scopeEmployeeIds: [] as string[],
      employeeId: ids.employees.ngoPhuong,
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
        scopeEmployeeIds: item.scopeEmployeeIds,
        employeeId: item.employeeId,
      },
      create: item,
    })
  }
}
