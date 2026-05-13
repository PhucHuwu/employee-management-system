import type { SeedContext } from '../context'

export const seedBranches = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.branches.hanoi,
      name: 'Hanoi',
      displayName: 'Hà Nội',
      color: '#2563eb',
      address: 'Tòa nhà FPT, Duy Tân, Cầu Giấy',
    },
    {
      id: ids.branches.hcm,
      name: 'HoChiMinh',
      displayName: 'Hồ Chí Minh',
      color: '#16a34a',
      address: 'Tòa nhà ETown, Tân Bình',
    },
    {
      id: ids.branches.danang,
      name: 'DaNang',
      displayName: 'Đà Nẵng',
      color: '#d97706',
      address: 'Khu công nghệ cao FPT, Ngũ Hành Sơn',
    },
    {
      id: ids.branches.cantho,
      name: 'CanTho',
      displayName: 'Cần Thơ',
      color: '#7c3aed',
      address: 'Khu đô thị mới Cái Răng',
    },
  ]

  for (const item of items) {
    await prisma.branch.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
