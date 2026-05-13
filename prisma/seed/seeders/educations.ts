import type { SeedContext } from '../context'

export const seedEducations = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.educations.ptit,
      name: 'Học viện Công nghệ Bưu chính Viễn thông',
      color: '#2563eb',
      educationTypeId: ids.educationTypes.university,
    },
    {
      id: ids.educations.hust,
      name: 'Đại học Bách Khoa Hà Nội',
      color: '#dc2626',
      educationTypeId: ids.educationTypes.university,
    },
    {
      id: ids.educations.fpt,
      name: 'Đại học FPT',
      color: '#16a34a',
      educationTypeId: ids.educationTypes.university,
    },
    {
      id: ids.educations.codegym,
      name: 'CodeGym',
      color: '#d97706',
      educationTypeId: ids.educationTypes.bootcamp,
    },
    {
      id: ids.educations.nash,
      name: 'NashTech Academy',
      color: '#7c3aed',
      educationTypeId: ids.educationTypes.bootcamp,
    },
    {
      id: ids.educations.funix,
      name: 'FUNiX',
      color: '#0891b2',
      educationTypeId: ids.educationTypes.online,
    },
  ]

  for (const item of items) {
    await prisma.education.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
