import type { SeedContext } from '../context'

export const seedCvSources = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.cvSources.topcv,
      name: 'TopCV',
      color: '#2563eb',
      referenceTo: 'https://topcv.vn',
    },
    {
      id: ids.cvSources.vietnamworks,
      name: 'VietnamWorks',
      color: '#dc2626',
      referenceTo: 'https://vietnamworks.com',
    },
    {
      id: ids.cvSources.linkedin,
      name: 'LinkedIn',
      color: '#0891b2',
      referenceTo: 'https://linkedin.com',
    },
    {
      id: ids.cvSources.facebook,
      name: 'Facebook',
      color: '#1d4ed8',
      referenceTo: 'https://facebook.com/groups/...',
    },
    {
      id: ids.cvSources.referral,
      name: 'Referral',
      color: '#16a34a',
      referenceTo: 'Nhân viên giới thiệu',
    },
    {
      id: ids.cvSources.itviec,
      name: 'ITviec',
      color: '#d97706',
      referenceTo: 'https://itviec.com',
    },
  ]

  for (const item of items) {
    await prisma.cVSource.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
