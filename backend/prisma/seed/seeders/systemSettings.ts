import type { SeedContext } from '../context'

export const seedSystemSettings = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    { id: ids.systemSettings.lockDay, key: 'lockDayOfMonth', value: '5', category: 'timesheet' },
    { id: ids.systemSettings.unlockWeeks, key: 'unlockWeeks', value: '2', category: 'timesheet' },
    { id: ids.systemSettings.maxHours, key: 'maxHoursPerDay', value: '8', category: 'timesheet' },
    { id: ids.systemSettings.smtpHost, key: 'smtpHost', value: 'smtp.gmail.com', category: 'email' },
    { id: ids.systemSettings.hrEmail, key: 'hrEmail', value: 'hr@company.com', category: 'working_time' },
    { id: ids.systemSettings.allowInternRemote, key: 'allowInternRemote', value: 'false', category: 'request' },
  ]

  for (const item of items) {
    await prisma.systemSetting.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
