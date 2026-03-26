import type { SeedContext } from '../context'

export const seedProjectMembers = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, state } = ctx

  const baseItems = [
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

  for (const item of baseItems) {
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

  const projectRoles = ['Tech Lead', 'Developer', 'QA Engineer', 'Business Analyst', 'Project Coordinator']
  const maxEmployees = Math.min(state.employeeIds.length, 18)
  const candidateEmployees = state.employeeIds.slice(0, maxEmployees)

  for (const [projectIndex, projectId] of state.projectIds.entries()) {
    const selected = candidateEmployees.filter((_, i) => (i + projectIndex) % 3 === 0).slice(0, 6)

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
}

