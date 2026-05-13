import type { SeedContext } from '../context'

export const seedProjectMemberShadows = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId } = ctx

  // Find project members first (seeded in projectMembers.ts)
  const pm1 = await prisma.projectMember.findFirst({
    where: { projectId: ids.projects.emsCore, employeeId: ids.employees.nguyenAn },
  })
  const pm2 = await prisma.projectMember.findFirst({
    where: { projectId: ids.projects.emsCore, employeeId: ids.employees.tranBinh },
  })

  if (!pm1 || !pm2) return

  const items = [
    {
      id: makeId('9d000000', 1),
      projectMemberId: pm1.id,
      targetEmployeeId: ids.employees.leCuong,
    },
    {
      id: makeId('9d000000', 2),
      projectMemberId: pm2.id,
      targetEmployeeId: ids.employees.phamDung,
    },
  ]

  for (const item of items) {
    await prisma.projectMemberShadow.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
