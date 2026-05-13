import type { SeedContext } from '../context'

export const seedProjectTasks = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.projectTasks.task1,
      name: 'Authentication Module',
      code: 'AUTH-001',
      description: 'Implement JWT authentication and authorization',
      projectId: ids.projects.emsCore,
    },
    {
      id: ids.projectTasks.task2,
      name: 'Employee CRUD API',
      code: 'EMP-001',
      description: 'REST APIs for employee management',
      projectId: ids.projects.emsCore,
    },
    {
      id: ids.projectTasks.task3,
      name: 'Dashboard UI',
      code: 'UI-001',
      description: 'Main dashboard with charts and widgets',
      projectId: ids.projects.emsCore,
    },
    {
      id: ids.projectTasks.task4,
      name: 'Mobile Login Screen',
      code: 'MOB-001',
      description: 'Login and registration screens',
      projectId: ids.projects.mobileApp,
    },
    {
      id: ids.projectTasks.task5,
      name: 'Data Pipeline',
      code: 'DATA-001',
      description: 'ETL pipeline for reporting',
      projectId: ids.projects.dataHub,
    },
  ]

  for (const item of items) {
    await prisma.projectTask.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
