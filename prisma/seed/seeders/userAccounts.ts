import { Role } from '@prisma/client'
import { hash } from 'bcrypt'

import type { SeedContext } from '../context'

export const seedUserAccounts = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId, state } = ctx

  const adminHash = await hash('admin123', 10)
  const managerHash = await hash('manager123', 10)
  const employeeHash = await hash('employee123', 10)

  const departments = [
    ids.departments.engineering,
    ids.departments.business,
    ids.departments.hr,
    ids.departments.finance,
  ]

  const projectIds = Object.values(ids.projects)

  // 1 Admin
  const admin = {
    id: ids.users.admin,
    email: 'admin@ems.local',
    passwordHash: adminHash,
    role: Role.ADMIN,
    active: true,
    departmentScopeId: null,
    projectScopeIds: [] as string[],
    scopeEmployeeIds: [] as string[],
  }

  await prisma.userAccount.upsert({
    where: { email: admin.email },
    update: {
      passwordHash: admin.passwordHash,
      role: admin.role,
      active: admin.active,
      departmentScopeId: admin.departmentScopeId,
      projectScopeIds: admin.projectScopeIds,
      scopeEmployeeIds: admin.scopeEmployeeIds,
    },
    create: admin,
  })

  // 10 Managers
  const baseManagers = [
    {
      id: ids.users.managerEngineering,
      email: 'manager.engineering@ems.local',
      departmentScopeId: ids.departments.engineering,
      projectScopeIds: [ids.projects.emsCore, ids.projects.mobileApp],
    },
    {
      id: ids.users.managerBusiness,
      email: 'manager.business@ems.local',
      departmentScopeId: ids.departments.business,
      projectScopeIds: [ids.projects.dataHub],
    },
  ]

  for (const [index, mgr] of baseManagers.entries()) {
    await prisma.userAccount.upsert({
      where: { email: mgr.email },
      update: {
        passwordHash: managerHash,
        role: Role.MANAGER,
        active: true,
        departmentScopeId: mgr.departmentScopeId,
        projectScopeIds: mgr.projectScopeIds,
        scopeEmployeeIds: [] as string[],
      },
      create: {
        id: mgr.id,
        email: mgr.email,
        passwordHash: managerHash,
        role: Role.MANAGER,
        active: true,
        departmentScopeId: mgr.departmentScopeId,
        projectScopeIds: mgr.projectScopeIds,
        scopeEmployeeIds: [] as string[],
      },
    })
  }

  for (let i = 3; i <= 10; i++) {
    const id = makeId('10000000', i + 20)
    const deptIndex = (i - 3) % departments.length
    const deptScopeId = departments[deptIndex]
    const projScope = projectIds.slice((i - 3) % projectIds.length, ((i - 3) % projectIds.length) + 2)

    await prisma.userAccount.upsert({
      where: { email: `manager.${i}@ems.local` },
      update: {
        passwordHash: managerHash,
        role: Role.MANAGER,
        active: true,
        departmentScopeId: deptScopeId,
        projectScopeIds: projScope.length > 0 ? projScope : projectIds,
        scopeEmployeeIds: [] as string[],
      },
      create: {
        id,
        email: `manager.${i}@ems.local`,
        passwordHash: managerHash,
        role: Role.MANAGER,
        active: true,
        departmentScopeId: deptScopeId,
        projectScopeIds: projScope.length > 0 ? projScope : projectIds,
        scopeEmployeeIds: [] as string[],
      },
    })
  }

  // 100 Employee accounts linked to Employee records
  const baseEmployeeUsers = [
    { id: ids.users.employeeNguyenAn, email: 'nguyen.an@ems.local', employeeId: ids.employees.nguyenAn },
    { id: ids.users.employeeTranBinh, email: 'tran.binh@ems.local', employeeId: ids.employees.tranBinh },
    { id: ids.users.employeeLeCuong, email: 'le.cuong@ems.local', employeeId: ids.employees.leCuong },
    { id: ids.users.employeePhamDung, email: 'pham.dung@ems.local', employeeId: ids.employees.phamDung },
    { id: ids.users.employeeHoangEm, email: 'hoang.em@ems.local', employeeId: ids.employees.hoangEm },
    { id: ids.users.employeeNgoPhuong, email: 'ngo.phuong@ems.local', employeeId: ids.employees.ngoPhuong },
  ]

  for (const item of baseEmployeeUsers) {
    await prisma.userAccount.upsert({
      where: { email: item.email },
      update: {
        passwordHash: employeeHash,
        role: Role.EMPLOYEE,
        active: true,
        departmentScopeId: null,
        projectScopeIds: [] as string[],
        scopeEmployeeIds: [] as string[],
        employeeId: item.employeeId,
      },
      create: {
        id: item.id,
        email: item.email,
        passwordHash: employeeHash,
        role: Role.EMPLOYEE,
        active: true,
        departmentScopeId: null,
        projectScopeIds: [] as string[],
        scopeEmployeeIds: [] as string[],
        employeeId: item.employeeId,
      },
    })
  }

  for (let i = 7; i <= 100; i++) {
    const employeeId = makeId('50000000', i)
    const id = makeId('10000000', i + 100)

    await prisma.userAccount.upsert({
      where: { email: `employee.${i}@ems.local` },
      update: {
        passwordHash: employeeHash,
        role: Role.EMPLOYEE,
        active: true,
        departmentScopeId: null,
        projectScopeIds: [] as string[],
        scopeEmployeeIds: [] as string[],
        employeeId,
      },
      create: {
        id,
        email: `employee.${i}@ems.local`,
        passwordHash: employeeHash,
        role: Role.EMPLOYEE,
        active: true,
        departmentScopeId: null,
        projectScopeIds: [] as string[],
        scopeEmployeeIds: [] as string[],
        employeeId,
      },
    })
  }
}
