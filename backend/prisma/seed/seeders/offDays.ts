import type { SeedContext } from '../context'

export const seedOffDays = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    { id: ids.offDays.newYear, offDate: new Date('2026-01-01'), name: 'Tết Dương lịch', note: 'Nghỉ 1 ngày' },
    { id: ids.offDays.tet1, offDate: new Date('2026-02-16'), name: 'Tết Nguyên đán', note: 'Nghỉ 5 ngày' },
    { id: ids.offDays.tet2, offDate: new Date('2026-02-17'), name: 'Tết Nguyên đán', note: 'Nghỉ 5 ngày' },
    { id: ids.offDays.tet3, offDate: new Date('2026-02-18'), name: 'Tết Nguyên đán', note: 'Nghỉ 5 ngày' },
    { id: ids.offDays.reunion, offDate: new Date('2026-03-10'), name: 'Giỗ Tổ Hùng Vương', note: 'Nghỉ 1 ngày' },
    { id: ids.offDays.liberation, offDate: new Date('2026-04-30'), name: 'Ngày Giải phóng miền Nam', note: 'Nghỉ 1 ngày' },
    { id: ids.offDays.labor, offDate: new Date('2026-05-01'), name: 'Ngày Quốc tế Lao động', note: 'Nghỉ 1 ngày' },
    { id: ids.offDays.midAutumn, offDate: new Date('2026-09-21'), name: 'Tết Trung thu', note: 'Nghỉ 1 ngày' },
    { id: ids.offDays.national, offDate: new Date('2026-09-02'), name: 'Quốc khánh', note: 'Nghỉ 1 ngày' },
  ]

  for (const item of items) {
    await prisma.offDay.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
