import type { SeedContext } from '../context'

export const seedLeaveTypes = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    { id: ids.leaveTypes.annual, name: 'Nghỉ phép năm', color: '#3b82f6', isPaid: true },
    { id: ids.leaveTypes.sick, name: 'Nghỉ ốm', color: '#ef4444', isPaid: true },
    { id: ids.leaveTypes.unpaid, name: 'Nghỉ không lương', color: '#6b7280', isPaid: false },
    { id: ids.leaveTypes.maternity, name: 'Nghỉ thai sản', color: '#ec4899', isPaid: true },
  ]

  for (const item of items) {
    await prisma.leaveType.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
