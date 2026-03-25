import {
  EmploymentStatus,
  FixedSchedule,
  PrismaClient,
  ProjectStatus,
  RevenueType,
  Role,
  ScheduleRequestStatus,
  ScheduleRequestType,
} from '@prisma/client'

const prisma = new PrismaClient()

const makeId = (prefix: string, index: number): string =>
  `${prefix}-0000-4000-8000-${index.toString().padStart(12, '0')}`

const ids = {
  users: {
    admin: '10000000-0000-4000-8000-000000000001',
    managerEngineering: '10000000-0000-4000-8000-000000000002',
    managerBusiness: '10000000-0000-4000-8000-000000000003',
  },
  departments: {
    engineering: '20000000-0000-4000-8000-000000000001',
    business: '20000000-0000-4000-8000-000000000002',
    hr: '20000000-0000-4000-8000-000000000003',
    finance: '20000000-0000-4000-8000-000000000004',
  },
  positions: {
    backend: '30000000-0000-4000-8000-000000000001',
    frontend: '30000000-0000-4000-8000-000000000002',
    qa: '30000000-0000-4000-8000-000000000003',
    pm: '30000000-0000-4000-8000-000000000004',
    sales: '30000000-0000-4000-8000-000000000005',
    hrbp: '30000000-0000-4000-8000-000000000006',
  },
  jobTitles: {
    junior: '40000000-0000-4000-8000-000000000001',
    middle: '40000000-0000-4000-8000-000000000002',
    senior: '40000000-0000-4000-8000-000000000003',
    lead: '40000000-0000-4000-8000-000000000004',
    manager: '40000000-0000-4000-8000-000000000005',
  },
  employees: {
    nguyenAn: '50000000-0000-4000-8000-000000000001',
    tranBinh: '50000000-0000-4000-8000-000000000002',
    leCuong: '50000000-0000-4000-8000-000000000003',
    phamDung: '50000000-0000-4000-8000-000000000004',
    hoangEm: '50000000-0000-4000-8000-000000000005',
    ngoPhuong: '50000000-0000-4000-8000-000000000006',
  },
  projects: {
    emsCore: '60000000-0000-4000-8000-000000000001',
    mobileApp: '60000000-0000-4000-8000-000000000002',
    dataHub: '60000000-0000-4000-8000-000000000003',
  },
  customers: {
    alpha: '70000000-0000-4000-8000-000000000001',
    beta: '70000000-0000-4000-8000-000000000002',
    gamma: '70000000-0000-4000-8000-000000000003',
  },
} as const

async function main(): Promise<void> {
  await clearAllData()
  await seedDepartments()
  await seedPositions()
  await seedJobTitles()
  await seedUserAccounts()
  await seedEmployees()
  await seedProjects()
  await seedProjectMembers()
  await seedCustomers()
  await seedProjectCustomers()
  await seedEmployeeTitleHistories()
  await seedScheduleRequests()
  await seedDailyReports()
  await seedProjectRevenues()
  await seedProjectDocuments()
  await seedExtendedData()
  await seedAuditLogs()
}

async function clearAllData(): Promise<void> {
  await prisma.auditLog.deleteMany()
  await prisma.projectDocument.deleteMany()
  await prisma.projectRevenue.deleteMany()
  await prisma.dailyReport.deleteMany()
  await prisma.scheduleRequest.deleteMany()
  await prisma.employeeTitleHistory.deleteMany()
  await prisma.projectCustomer.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.project.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.userAccount.deleteMany()
  await prisma.jobTitle.deleteMany()
  await prisma.position.deleteMany()
  await prisma.department.deleteMany()
}

async function seedExtendedData(): Promise<void> {
  const extraEmployees = [
    { fullName: 'Đặng Minh Quân', address: 'Hà Nội', departmentId: ids.departments.engineering, positionId: ids.positions.backend, fixedSchedule: FixedSchedule.SHIFT_9_6 },
    { fullName: 'Bùi Hải Yến', address: 'Hồ Chí Minh', departmentId: ids.departments.engineering, positionId: ids.positions.frontend, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Võ Tuấn Khải', address: 'Đà Nẵng', departmentId: ids.departments.business, positionId: ids.positions.sales, fixedSchedule: FixedSchedule.SHIFT_9_6 },
    { fullName: 'Trương Lan Anh', address: 'Hải Phòng', departmentId: ids.departments.hr, positionId: ids.positions.hrbp, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Phan Nhật Nam', address: 'Cần Thơ', departmentId: ids.departments.finance, positionId: ids.positions.pm, fixedSchedule: FixedSchedule.SHIFT_9_6 },
    { fullName: 'Lý Ngọc Mai', address: 'Huế', departmentId: ids.departments.engineering, positionId: ids.positions.qa, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Nguyễn Đức Long', address: 'Bình Dương', departmentId: ids.departments.business, positionId: ids.positions.sales, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Mai Thanh Hà', address: 'Khánh Hòa', departmentId: ids.departments.engineering, positionId: ids.positions.frontend, fixedSchedule: FixedSchedule.SHIFT_9_6 },
    { fullName: 'Lê Thu Trang', address: 'Hà Nội', departmentId: ids.departments.hr, positionId: ids.positions.hrbp, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Đinh Quốc Bảo', address: 'Quảng Ninh', departmentId: ids.departments.engineering, positionId: ids.positions.backend, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Tạ Bảo Châu', address: 'Hồ Chí Minh', departmentId: ids.departments.finance, positionId: ids.positions.pm, fixedSchedule: FixedSchedule.SHIFT_9_6 },
    { fullName: 'Trần Hữu Phúc', address: 'Đồng Nai', departmentId: ids.departments.engineering, positionId: ids.positions.qa, fixedSchedule: FixedSchedule.SHIFT_8_5 },
  ]

  const extraEmployeeIds: string[] = []
  for (const [index, item] of extraEmployees.entries()) {
    const id = makeId('51000000', index + 1)
    extraEmployeeIds.push(id)
    await prisma.employee.upsert({
      where: { id },
      update: {
        fullName: item.fullName,
        dob: new Date(1990 + (index % 8), index % 12, (index % 27) + 1),
        address: item.address,
        fixedSchedule: item.fixedSchedule,
        employmentStatus: EmploymentStatus.ACTIVE,
        departmentId: item.departmentId,
        positionId: item.positionId,
      },
      create: {
        id,
        fullName: item.fullName,
        dob: new Date(1990 + (index % 8), index % 12, (index % 27) + 1),
        address: item.address,
        fixedSchedule: item.fixedSchedule,
        employmentStatus: EmploymentStatus.ACTIVE,
        departmentId: item.departmentId,
        positionId: item.positionId,
      },
    })
  }

  const extraProjects = [
    { code: 'EMS-CRM', name: 'Customer Relationship Center', status: ProjectStatus.RUNNING, startDate: new Date('2026-01-15'), endDate: new Date('2026-11-30'), description: 'CRM module and customer portal' },
    { code: 'EMS-HR', name: 'HR Automation Suite', status: ProjectStatus.RUNNING, startDate: new Date('2026-02-10'), endDate: new Date('2026-12-20'), description: 'HR workflows automation and approvals' },
    { code: 'EMS-BI', name: 'Business Intelligence Dashboards', status: ProjectStatus.PAUSED, startDate: new Date('2026-01-20'), endDate: new Date('2026-09-30'), description: 'Executive dashboards and KPIs' },
    { code: 'EMS-OPS', name: 'Operations Optimization', status: ProjectStatus.RUNNING, startDate: new Date('2026-03-01'), endDate: new Date('2026-12-31'), description: 'Operational efficiency improvements' },
    { code: 'EMS-ARCHIVE', name: 'Legacy Data Archive', status: ProjectStatus.ENDED, startDate: new Date('2025-01-01'), endDate: new Date('2025-10-31'), description: 'Archive historical operational data' },
  ]

  const extraProjectIds: string[] = []
  for (const [index, item] of extraProjects.entries()) {
    const id = makeId('61000000', index + 1)
    extraProjectIds.push(id)
    await prisma.project.upsert({
      where: { id },
      update: item,
      create: { id, ...item },
    })
  }

  const allProjectIds = [...Object.values(ids.projects), ...extraProjectIds]
  const allEmployeeIds = [...Object.values(ids.employees), ...extraEmployeeIds]
  const projectRoles = ['Tech Lead', 'Developer', 'QA Engineer', 'Business Analyst', 'Project Coordinator']

  for (const [projectIndex, projectId] of allProjectIds.entries()) {
    const selected = allEmployeeIds.filter((_, i) => (i + projectIndex) % 3 === 0).slice(0, 5)
    for (const [memberIndex, employeeId] of selected.entries()) {
      await prisma.projectMember.upsert({
        where: {
          projectId_employeeId: { projectId, employeeId },
        },
        update: {
          roleInProject: projectRoles[(projectIndex + memberIndex) % projectRoles.length],
          joinedAt: new Date(2026, (projectIndex + memberIndex) % 5, (memberIndex % 20) + 1),
          leftAt: null,
        },
        create: {
          projectId,
          employeeId,
          roleInProject: projectRoles[(projectIndex + memberIndex) % projectRoles.length],
          joinedAt: new Date(2026, (projectIndex + memberIndex) % 5, (memberIndex % 20) + 1),
          leftAt: null,
        },
      })
    }
  }

  const extraCustomers = [
    { companyName: 'Delta Logistics', city: 'Hà Nội', contactName: 'Nguyễn Hải Sơn' },
    { companyName: 'Epsilon Retail', city: 'Hồ Chí Minh', contactName: 'Trần Mỹ Linh' },
    { companyName: 'Zeta Software', city: 'Đà Nẵng', contactName: 'Lê Quang Trung' },
    { companyName: 'Theta Healthcare', city: 'Cần Thơ', contactName: 'Phạm Thu Hương' },
  ]

  const allCustomerIds: string[] = [...Object.values(ids.customers)]
  for (const [index, item] of extraCustomers.entries()) {
    const id = makeId('71000000', index + 1)
    allCustomerIds.push(id)
    await prisma.customer.upsert({
      where: { id },
      update: {
        companyName: item.companyName,
        businessAddress: `${index + 10} Trần Hưng Đạo, ${item.city}`,
        contactAddress: `${index + 10} Trần Hưng Đạo, ${item.city}`,
        city: item.city,
        country: 'Vietnam',
        contactName: item.contactName,
        contactEmail: `contact${index + 10}@example.com`,
        contactPhone: `09100000${index}`,
        cooperationStatus: 'ACTIVE',
      },
      create: {
        id,
        companyName: item.companyName,
        taxCode: `04${index}1234567`,
        businessAddress: `${index + 10} Trần Hưng Đạo, ${item.city}`,
        contactAddress: `${index + 10} Trần Hưng Đạo, ${item.city}`,
        city: item.city,
        country: 'Vietnam',
        contactName: item.contactName,
        contactEmail: `contact${index + 10}@example.com`,
        contactPhone: `09100000${index}`,
        paymentTerms: 'NET 30',
        cooperationStatus: 'ACTIVE',
      },
    })
  }

  for (const [index, projectId] of allProjectIds.entries()) {
    const customerId = allCustomerIds[index % allCustomerIds.length]
    await prisma.projectCustomer.upsert({
      where: {
        projectId_customerId: { projectId, customerId },
      },
      update: { projectId, customerId },
      create: { projectId, customerId },
    })
  }

  for (const [index, employeeId] of extraEmployeeIds.entries()) {
    const titleId = [ids.jobTitles.junior, ids.jobTitles.middle, ids.jobTitles.senior][index % 3]
    const effectiveDate = new Date(2024, index % 10, (index % 20) + 1)
    await prisma.employeeTitleHistory.upsert({
      where: {
        employeeId_effectiveDate: { employeeId, effectiveDate },
      },
      update: {
        oldJobTitleId: null,
        newJobTitleId: titleId,
        reason: 'Initial assignment (extended seed)',
        createdBy: ids.users.admin,
      },
      create: {
        id: makeId('82000000', index + 1),
        employeeId,
        oldJobTitleId: null,
        newJobTitleId: titleId,
        effectiveDate,
        reason: 'Initial assignment (extended seed)',
        createdBy: ids.users.admin,
      },
    })
  }

  for (let i = 0; i < 60; i += 1) {
    const employeeId = allEmployeeIds[i % Math.min(allEmployeeIds.length, 14)]
    const requestType = [
      ScheduleRequestType.OFF_FULL_DAY,
      ScheduleRequestType.OFF_AM,
      ScheduleRequestType.OFF_PM,
      ScheduleRequestType.REMOTE_FULL_DAY,
      ScheduleRequestType.REMOTE_AM,
      ScheduleRequestType.REMOTE_PM,
      ScheduleRequestType.CHANGE_FIXED_SCHEDULE,
    ][i % 7]
    const status = [
      ScheduleRequestStatus.PENDING,
      ScheduleRequestStatus.APPROVED,
      ScheduleRequestStatus.REJECTED,
      ScheduleRequestStatus.CANCELLED,
    ][i % 4]

    const approvedBy = status === ScheduleRequestStatus.PENDING || status === ScheduleRequestStatus.CANCELLED
      ? null
      : i % 2 === 0
        ? ids.users.managerEngineering
        : ids.users.managerBusiness

    await prisma.scheduleRequest.upsert({
      where: { id: makeId('95000000', i + 1) },
      update: {
        employeeId,
        requestType,
        requestDate: new Date(2026, 3, (i % 28) + 1),
        requestedSchedule: requestType === ScheduleRequestType.CHANGE_FIXED_SCHEDULE
          ? (i % 2 === 0 ? FixedSchedule.SHIFT_8_5 : FixedSchedule.SHIFT_9_6)
          : null,
        status,
        reason: `Seed request #${i + 1}`,
        rejectionReason: status === ScheduleRequestStatus.REJECTED ? 'Không phù hợp lịch bàn giao' : null,
        approvedBy,
        approvedAt: approvedBy ? new Date(2026, 3, (i % 28) + 1, 8, 30) : null,
      },
      create: {
        id: makeId('95000000', i + 1),
        employeeId,
        requestType,
        requestDate: new Date(2026, 3, (i % 28) + 1),
        requestedSchedule: requestType === ScheduleRequestType.CHANGE_FIXED_SCHEDULE
          ? (i % 2 === 0 ? FixedSchedule.SHIFT_8_5 : FixedSchedule.SHIFT_9_6)
          : null,
        status,
        reason: `Seed request #${i + 1}`,
        rejectionReason: status === ScheduleRequestStatus.REJECTED ? 'Không phù hợp lịch bàn giao' : null,
        approvedBy,
        approvedAt: approvedBy ? new Date(2026, 3, (i % 28) + 1, 8, 30) : null,
      },
    })
  }

  for (let i = 0; i < 180; i += 1) {
    const employeeId = allEmployeeIds[i % Math.min(allEmployeeIds.length, 16)]
    const projectId = allProjectIds[i % allProjectIds.length]
    const reportDate = new Date(2026, 2, (i % 28) + 1)
    await prisma.dailyReport.upsert({
      where: {
        employeeId_reportDate_projectId: {
          employeeId,
          reportDate,
          projectId,
        },
      },
      update: {
        employeeId,
        projectId,
        reportDate,
        task: `Task ${i + 1}: Sprint execution`,
        workContent: `Completed workload item ${i + 1}, updated docs, and synced with team on project milestones.`,
      },
      create: {
        id: makeId('96000000', i + 1),
        employeeId,
        projectId,
        reportDate,
        task: `Task ${i + 1}: Sprint execution`,
        workContent: `Completed workload item ${i + 1}, updated docs, and synced with team on project milestones.`,
      },
    })
  }

  let revenueIndex = 1
  for (const projectId of allProjectIds) {
    for (let month = 1; month <= 6; month += 1) {
      for (const revenueType of [RevenueType.FORECAST, RevenueType.ACTUAL]) {
        await prisma.projectRevenue.upsert({
          where: { id: makeId('97000000', revenueIndex) },
          update: {
            projectId,
            periodMonth: month,
            periodYear: 2026,
            revenueType,
            amount: 150000000 + month * 10000000 + (revenueType === RevenueType.ACTUAL ? 5000000 : 0),
            currency: 'VND',
            note: `Seed ${revenueType.toLowerCase()} M${month}/2026`,
          },
          create: {
            id: makeId('97000000', revenueIndex),
            projectId,
            periodMonth: month,
            periodYear: 2026,
            revenueType,
            amount: 150000000 + month * 10000000 + (revenueType === RevenueType.ACTUAL ? 5000000 : 0),
            currency: 'VND',
            note: `Seed ${revenueType.toLowerCase()} M${month}/2026`,
          },
        })
        revenueIndex += 1
      }
    }
  }

  let docIndex = 1
  for (const projectId of allProjectIds) {
    for (const [fileIndex, ext] of ['pdf', 'docx'].entries()) {
      await prisma.projectDocument.upsert({
        where: { id: makeId('98000000', docIndex) },
        update: {
          projectId,
          fileName: `seed-document-${fileIndex + 1}.${ext}`,
          storageKey: `seed/${projectId}/seed-document-${fileIndex + 1}.${ext}`,
          mimeType: ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          sizeBytes: BigInt(1024 * 50 * (fileIndex + 1)),
          uploadedBy: ids.users.admin,
        },
        create: {
          id: makeId('98000000', docIndex),
          projectId,
          fileName: `seed-document-${fileIndex + 1}.${ext}`,
          storageKey: `seed/${projectId}/seed-document-${fileIndex + 1}.${ext}`,
          mimeType: ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          sizeBytes: BigInt(1024 * 50 * (fileIndex + 1)),
          uploadedBy: ids.users.admin,
        },
      })
      docIndex += 1
    }
  }

  for (let i = 0; i < 30; i += 1) {
    await prisma.auditLog.upsert({
      where: { id: makeId('99000000', i + 1) },
      update: {
        actorId: i % 2 === 0 ? ids.users.admin : ids.users.managerEngineering,
        actorRole: i % 2 === 0 ? Role.ADMIN : Role.MANAGER,
        action: i % 3 === 0 ? 'PROJECT_UPDATED' : i % 3 === 1 ? 'EMPLOYEE_UPDATED' : 'SCHEDULE_REQUEST_APPROVED',
        entityType: i % 3 === 0 ? 'PROJECT' : i % 3 === 1 ? 'EMPLOYEE' : 'SCHEDULE_REQUEST',
        entityId: i % 3 === 0 ? allProjectIds[i % allProjectIds.length] : allEmployeeIds[i % allEmployeeIds.length],
        oldData: { seed: true, version: 1 },
        newData: { seed: true, version: 2, index: i + 1 },
      },
      create: {
        id: makeId('99000000', i + 1),
        actorId: i % 2 === 0 ? ids.users.admin : ids.users.managerEngineering,
        actorRole: i % 2 === 0 ? Role.ADMIN : Role.MANAGER,
        action: i % 3 === 0 ? 'PROJECT_UPDATED' : i % 3 === 1 ? 'EMPLOYEE_UPDATED' : 'SCHEDULE_REQUEST_APPROVED',
        entityType: i % 3 === 0 ? 'PROJECT' : i % 3 === 1 ? 'EMPLOYEE' : 'SCHEDULE_REQUEST',
        entityId: i % 3 === 0 ? allProjectIds[i % allProjectIds.length] : allEmployeeIds[i % allEmployeeIds.length],
        oldData: { seed: true, version: 1 },
        newData: { seed: true, version: 2, index: i + 1 },
      },
    })
  }
}

async function seedDepartments(): Promise<void> {
  const items = [
    { id: ids.departments.engineering, name: 'Engineering' },
    { id: ids.departments.business, name: 'Business Development' },
    { id: ids.departments.hr, name: 'Human Resources' },
    { id: ids.departments.finance, name: 'Finance' },
  ]

  for (const item of items) {
    await prisma.department.upsert({
      where: { id: item.id },
      update: { name: item.name },
      create: item,
    })
  }
}

async function seedPositions(): Promise<void> {
  const items = [
    { id: ids.positions.backend, name: 'Backend Developer', description: 'API and integration', active: true },
    { id: ids.positions.frontend, name: 'Frontend Developer', description: 'Web UI development', active: true },
    { id: ids.positions.qa, name: 'QA Engineer', description: 'Quality assurance and testing', active: true },
    { id: ids.positions.pm, name: 'Project Manager', description: 'Project planning and delivery', active: true },
    { id: ids.positions.sales, name: 'Sales Executive', description: 'Customer acquisition', active: true },
    { id: ids.positions.hrbp, name: 'HR Business Partner', description: 'People operations', active: true },
  ]

  for (const item of items) {
    await prisma.position.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

async function seedJobTitles(): Promise<void> {
  const items = [
    { id: ids.jobTitles.junior, name: 'Junior', levelOrder: 1, description: 'Entry level', active: true },
    { id: ids.jobTitles.middle, name: 'Middle', levelOrder: 2, description: 'Mid level', active: true },
    { id: ids.jobTitles.senior, name: 'Senior', levelOrder: 3, description: 'Senior level', active: true },
    { id: ids.jobTitles.lead, name: 'Lead', levelOrder: 4, description: 'Team lead', active: true },
    { id: ids.jobTitles.manager, name: 'Manager', levelOrder: 5, description: 'Department manager', active: true },
  ]

  for (const item of items) {
    await prisma.jobTitle.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

async function seedUserAccounts(): Promise<void> {
  const items = [
    {
      id: ids.users.admin,
      email: 'admin@ems.local',
      passwordHash: 'admin123',
      role: Role.ADMIN,
      active: true,
      departmentScopeId: null,
      projectScopeIds: [] as string[],
    },
    {
      id: ids.users.managerEngineering,
      email: 'manager.engineering@ems.local',
      passwordHash: 'manager123',
      role: Role.MANAGER,
      active: true,
      departmentScopeId: ids.departments.engineering,
      projectScopeIds: [ids.projects.emsCore, ids.projects.mobileApp],
    },
    {
      id: ids.users.managerBusiness,
      email: 'manager.business@ems.local',
      passwordHash: 'manager123',
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

async function seedEmployees(): Promise<void> {
  const items = [
    {
      id: ids.employees.nguyenAn,
      fullName: 'Nguyễn Văn An',
      dob: new Date('1990-05-15'),
      address: 'Hà Nội',
      fixedSchedule: FixedSchedule.SHIFT_8_5,
      employmentStatus: EmploymentStatus.ACTIVE,
      departmentId: ids.departments.engineering,
      positionId: ids.positions.backend,
    },
    {
      id: ids.employees.tranBinh,
      fullName: 'Trần Thị Bình',
      dob: new Date('1993-08-20'),
      address: 'Hồ Chí Minh',
      fixedSchedule: FixedSchedule.SHIFT_9_6,
      employmentStatus: EmploymentStatus.ACTIVE,
      departmentId: ids.departments.engineering,
      positionId: ids.positions.frontend,
    },
    {
      id: ids.employees.leCuong,
      fullName: 'Lê Văn Cường',
      dob: new Date('1988-12-01'),
      address: 'Đà Nẵng',
      fixedSchedule: FixedSchedule.SHIFT_8_5,
      employmentStatus: EmploymentStatus.ACTIVE,
      departmentId: ids.departments.business,
      positionId: ids.positions.sales,
    },
    {
      id: ids.employees.phamDung,
      fullName: 'Phạm Thị Dung',
      dob: new Date('1992-03-11'),
      address: 'Hải Phòng',
      fixedSchedule: FixedSchedule.SHIFT_9_6,
      employmentStatus: EmploymentStatus.ACTIVE,
      departmentId: ids.departments.hr,
      positionId: ids.positions.hrbp,
    },
    {
      id: ids.employees.hoangEm,
      fullName: 'Hoàng Văn Em',
      dob: new Date('1995-07-09'),
      address: 'Cần Thơ',
      fixedSchedule: FixedSchedule.SHIFT_8_5,
      employmentStatus: EmploymentStatus.ACTIVE,
      departmentId: ids.departments.engineering,
      positionId: ids.positions.qa,
    },
    {
      id: ids.employees.ngoPhuong,
      fullName: 'Ngô Thị Phương',
      dob: new Date('1989-01-18'),
      address: 'Hà Nội',
      fixedSchedule: FixedSchedule.SHIFT_8_5,
      employmentStatus: EmploymentStatus.INACTIVE,
      departmentId: ids.departments.finance,
      positionId: ids.positions.pm,
    },
  ]

  for (const item of items) {
    await prisma.employee.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

async function seedProjects(): Promise<void> {
  const items = [
    {
      id: ids.projects.emsCore,
      code: 'EMS-CORE',
      name: 'Employee Management Core',
      status: ProjectStatus.RUNNING,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      description: 'Core platform for employee management',
    },
    {
      id: ids.projects.mobileApp,
      code: 'EMS-MOBILE',
      name: 'Employee Mobile App',
      status: ProjectStatus.PAUSED,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-10-30'),
      description: 'Mobile companion app',
    },
    {
      id: ids.projects.dataHub,
      code: 'EMS-DATA',
      name: 'Data and Reporting Hub',
      status: ProjectStatus.ENDED,
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-12-31'),
      description: 'Data warehouse and BI dashboards',
    },
  ]

  for (const item of items) {
    await prisma.project.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

async function seedProjectMembers(): Promise<void> {
  const items = [
    {
      projectId: ids.projects.emsCore,
      employeeId: ids.employees.nguyenAn,
      roleInProject: 'Tech Lead',
      joinedAt: new Date('2026-01-01'),
      leftAt: null,
    },
    {
      projectId: ids.projects.emsCore,
      employeeId: ids.employees.tranBinh,
      roleInProject: 'Frontend Developer',
      joinedAt: new Date('2026-01-10'),
      leftAt: null,
    },
    {
      projectId: ids.projects.emsCore,
      employeeId: ids.employees.hoangEm,
      roleInProject: 'QA Engineer',
      joinedAt: new Date('2026-01-10'),
      leftAt: null,
    },
    {
      projectId: ids.projects.mobileApp,
      employeeId: ids.employees.tranBinh,
      roleInProject: 'UI Developer',
      joinedAt: new Date('2026-02-01'),
      leftAt: null,
    },
    {
      projectId: ids.projects.dataHub,
      employeeId: ids.employees.leCuong,
      roleInProject: 'Business Owner',
      joinedAt: new Date('2025-03-15'),
      leftAt: new Date('2025-12-31'),
    },
  ]

  for (const item of items) {
    await prisma.projectMember.upsert({
      where: {
        projectId_employeeId: {
          projectId: item.projectId,
          employeeId: item.employeeId,
        },
      },
      update: item,
      create: item,
    })
  }
}

async function seedCustomers(): Promise<void> {
  const items = [
    {
      id: ids.customers.alpha,
      companyName: 'Alpha Solutions Co., Ltd',
      taxCode: '0101234567',
      businessAddress: '1 Lê Lợi, Hồ Chí Minh',
      contactAddress: '1 Lê Lợi, Hồ Chí Minh',
      country: 'Vietnam',
      city: 'Hồ Chí Minh',
      contactName: 'Trần Minh Khang',
      contactTitle: 'Director',
      contactEmail: 'khang@alpha.example',
      contactPhone: '0901111111',
      paymentTerms: 'NET 30',
      notes: 'Strategic customer',
      cooperationStatus: 'ACTIVE',
    },
    {
      id: ids.customers.beta,
      companyName: 'Beta Manufacturing JSC',
      taxCode: '0207654321',
      businessAddress: '99 Nguyễn Trãi, Hà Nội',
      contactAddress: '99 Nguyễn Trãi, Hà Nội',
      country: 'Vietnam',
      city: 'Hà Nội',
      contactName: 'Lê Hoàng Gia',
      contactTitle: 'PMO Lead',
      contactEmail: 'gia@beta.example',
      contactPhone: '0902222222',
      paymentTerms: 'NET 45',
      notes: 'Manufacturing vertical',
      cooperationStatus: 'ACTIVE',
    },
    {
      id: ids.customers.gamma,
      companyName: 'Gamma Holdings',
      taxCode: '0309988776',
      businessAddress: '5 Trần Phú, Đà Nẵng',
      contactAddress: '5 Trần Phú, Đà Nẵng',
      country: 'Vietnam',
      city: 'Đà Nẵng',
      contactName: 'Ngô Bảo Châu',
      contactTitle: 'Head of IT',
      contactEmail: 'chau@gamma.example',
      contactPhone: '0903333333',
      paymentTerms: 'NET 15',
      notes: 'Pilot customer',
      cooperationStatus: 'PAUSED',
    },
  ]

  for (const item of items) {
    await prisma.customer.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

async function seedProjectCustomers(): Promise<void> {
  const items = [
    { projectId: ids.projects.emsCore, customerId: ids.customers.alpha },
    { projectId: ids.projects.mobileApp, customerId: ids.customers.beta },
    { projectId: ids.projects.dataHub, customerId: ids.customers.gamma },
  ]

  for (const item of items) {
    await prisma.projectCustomer.upsert({
      where: {
        projectId_customerId: {
          projectId: item.projectId,
          customerId: item.customerId,
        },
      },
      update: item,
      create: item,
    })
  }
}

async function seedEmployeeTitleHistories(): Promise<void> {
  const items = [
    {
      id: '80000000-0000-0000-0000-000000000001',
      employeeId: ids.employees.nguyenAn,
      oldJobTitleId: null,
      newJobTitleId: ids.jobTitles.senior,
      effectiveDate: new Date('2024-01-01'),
      reason: 'Initial assignment',
      createdBy: ids.users.admin,
    },
    {
      id: '80000000-0000-0000-0000-000000000002',
      employeeId: ids.employees.nguyenAn,
      oldJobTitleId: ids.jobTitles.senior,
      newJobTitleId: ids.jobTitles.lead,
      effectiveDate: new Date('2025-06-01'),
      reason: 'Strong delivery ownership',
      createdBy: ids.users.admin,
    },
    {
      id: '80000000-0000-0000-0000-000000000003',
      employeeId: ids.employees.tranBinh,
      oldJobTitleId: null,
      newJobTitleId: ids.jobTitles.middle,
      effectiveDate: new Date('2024-03-01'),
      reason: 'Initial assignment',
      createdBy: ids.users.admin,
    },
    {
      id: '80000000-0000-0000-0000-000000000004',
      employeeId: ids.employees.leCuong,
      oldJobTitleId: null,
      newJobTitleId: ids.jobTitles.manager,
      effectiveDate: new Date('2023-01-01'),
      reason: 'Department head assignment',
      createdBy: ids.users.admin,
    },
  ]

  for (const item of items) {
    await prisma.employeeTitleHistory.upsert({
      where: {
        employeeId_effectiveDate: {
          employeeId: item.employeeId,
          effectiveDate: item.effectiveDate,
        },
      },
      update: {
        oldJobTitleId: item.oldJobTitleId,
        newJobTitleId: item.newJobTitleId,
        reason: item.reason,
        createdBy: item.createdBy,
      },
      create: item,
    })
  }
}

async function seedScheduleRequests(): Promise<void> {
  const items = [
    {
      id: '90000000-0000-0000-0000-000000000001',
      employeeId: ids.employees.nguyenAn,
      requestType: ScheduleRequestType.OFF_FULL_DAY,
      requestDate: new Date('2026-04-05'),
      requestedSchedule: null,
      status: ScheduleRequestStatus.PENDING,
      reason: 'Family event',
      rejectionReason: null,
      approvedBy: null,
      approvedAt: null,
    },
    {
      id: '90000000-0000-0000-0000-000000000002',
      employeeId: ids.employees.tranBinh,
      requestType: ScheduleRequestType.REMOTE_FULL_DAY,
      requestDate: new Date('2026-04-06'),
      requestedSchedule: null,
      status: ScheduleRequestStatus.APPROVED,
      reason: 'Focus coding day',
      rejectionReason: null,
      approvedBy: ids.users.managerEngineering,
      approvedAt: new Date('2026-04-04T09:00:00Z'),
    },
    {
      id: '90000000-0000-0000-0000-000000000003',
      employeeId: ids.employees.hoangEm,
      requestType: ScheduleRequestType.OFF_AM,
      requestDate: new Date('2026-04-07'),
      requestedSchedule: null,
      status: ScheduleRequestStatus.REJECTED,
      reason: 'Medical checkup',
      rejectionReason: 'Release day, please reschedule',
      approvedBy: ids.users.managerEngineering,
      approvedAt: new Date('2026-04-05T10:00:00Z'),
    },
    {
      id: '90000000-0000-0000-0000-000000000004',
      employeeId: ids.employees.leCuong,
      requestType: ScheduleRequestType.CHANGE_FIXED_SCHEDULE,
      requestDate: new Date('2026-04-08'),
      requestedSchedule: FixedSchedule.SHIFT_9_6,
      status: ScheduleRequestStatus.APPROVED,
      reason: 'Align with customer timezone',
      rejectionReason: null,
      approvedBy: ids.users.managerBusiness,
      approvedAt: new Date('2026-04-06T08:30:00Z'),
    },
  ]

  for (const item of items) {
    await prisma.scheduleRequest.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

async function seedDailyReports(): Promise<void> {
  const items = [
    {
      id: '91000000-0000-0000-0000-000000000001',
      employeeId: ids.employees.nguyenAn,
      projectId: ids.projects.emsCore,
      reportDate: new Date('2026-03-24'),
      task: 'Implement employee filters',
      workContent: 'Completed filter by position and department in list API and UI',
    },
    {
      id: '91000000-0000-0000-0000-000000000002',
      employeeId: ids.employees.nguyenAn,
      projectId: ids.projects.emsCore,
      reportDate: new Date('2026-03-25'),
      task: 'Review merge requests',
      workContent: 'Reviewed and merged 3 PRs for schedule and approval module',
    },
    {
      id: '91000000-0000-0000-0000-000000000003',
      employeeId: ids.employees.tranBinh,
      projectId: ids.projects.mobileApp,
      reportDate: new Date('2026-03-25'),
      task: 'Build dashboard cards',
      workContent: 'Implemented KPI cards and responsive layout',
    },
    {
      id: '91000000-0000-0000-0000-000000000004',
      employeeId: ids.employees.hoangEm,
      projectId: ids.projects.emsCore,
      reportDate: new Date('2026-03-25'),
      task: 'Test approval flow',
      workContent: 'Validated approve/reject flow and reported 2 defects',
    },
    {
      id: '91000000-0000-0000-0000-000000000005',
      employeeId: ids.employees.leCuong,
      projectId: ids.projects.dataHub,
      reportDate: new Date('2025-12-15'),
      task: 'Finalize business metrics',
      workContent: 'Completed KPI definitions for monthly report',
    },
  ]

  for (const item of items) {
    await prisma.dailyReport.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

async function seedProjectRevenues(): Promise<void> {
  const items = [
    {
      id: '92000000-0000-0000-0000-000000000001',
      projectId: ids.projects.emsCore,
      periodMonth: 3,
      periodYear: 2026,
      revenueType: RevenueType.FORECAST,
      amount: 500000000,
      currency: 'VND',
      note: 'March forecast',
    },
    {
      id: '92000000-0000-0000-0000-000000000002',
      projectId: ids.projects.emsCore,
      periodMonth: 3,
      periodYear: 2026,
      revenueType: RevenueType.ACTUAL,
      amount: 480000000,
      currency: 'VND',
      note: 'March actual',
    },
    {
      id: '92000000-0000-0000-0000-000000000003',
      projectId: ids.projects.mobileApp,
      periodMonth: 4,
      periodYear: 2026,
      revenueType: RevenueType.FORECAST,
      amount: 300000000,
      currency: 'VND',
      note: 'Paused project baseline',
    },
  ]

  for (const item of items) {
    await prisma.projectRevenue.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

async function seedProjectDocuments(): Promise<void> {
  const items = [
    {
      id: '93000000-0000-0000-0000-000000000001',
      projectId: ids.projects.emsCore,
      fileName: 'requirements-v1.pdf',
      storageKey: 'seed/ems-core/requirements-v1.pdf',
      mimeType: 'application/pdf',
      sizeBytes: BigInt(245760),
      uploadedBy: ids.users.admin,
    },
    {
      id: '93000000-0000-0000-0000-000000000002',
      projectId: ids.projects.emsCore,
      fileName: 'system-design-v2.docx',
      storageKey: 'seed/ems-core/system-design-v2.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: BigInt(163840),
      uploadedBy: ids.users.managerEngineering,
    },
    {
      id: '93000000-0000-0000-0000-000000000003',
      projectId: ids.projects.mobileApp,
      fileName: 'mobile-ui-kit.fig',
      storageKey: 'seed/mobile-app/mobile-ui-kit.fig',
      mimeType: 'application/octet-stream',
      sizeBytes: BigInt(81920),
      uploadedBy: ids.users.managerEngineering,
    },
  ]

  for (const item of items) {
    await prisma.projectDocument.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

async function seedAuditLogs(): Promise<void> {
  const items = [
    {
      id: '94000000-0000-0000-0000-000000000001',
      actorId: ids.users.admin,
      actorRole: Role.ADMIN,
      action: 'EMPLOYEE_CREATED',
      entityType: 'EMPLOYEE',
      entityId: ids.employees.nguyenAn,
      oldData: undefined,
      newData: { fullName: 'Nguyễn Văn An' },
    },
    {
      id: '94000000-0000-0000-0000-000000000002',
      actorId: ids.users.managerEngineering,
      actorRole: Role.MANAGER,
      action: 'SCHEDULE_REQUEST_APPROVED',
      entityType: 'SCHEDULE_REQUEST',
      entityId: '90000000-0000-0000-0000-000000000002',
      oldData: { status: 'PENDING' },
      newData: { status: 'APPROVED' },
    },
    {
      id: '94000000-0000-0000-0000-000000000003',
      actorId: ids.users.managerBusiness,
      actorRole: Role.MANAGER,
      action: 'PROJECT_REVENUE_CREATED',
      entityType: 'PROJECT_REVENUE',
      entityId: '92000000-0000-0000-0000-000000000001',
      oldData: undefined,
      newData: { amount: 500000000, currency: 'VND' },
    },
  ]

  for (const item of items) {
    await prisma.auditLog.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    await prisma.$disconnect()
    throw error
  })
