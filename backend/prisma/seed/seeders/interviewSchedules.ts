import type { SeedContext } from '../context'

export const seedInterviewSchedules = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.interviewSchedules.schedule1,
      scheduledAt: new Date('2026-03-10T09:00:00'),
      location: 'Phòng họp A - Tầng 3',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      candidateId: ids.candidates.candidate2,
      interviewerIds: [ids.employees.nguyenAn, ids.employees.leCuong],
    },
    {
      id: ids.interviewSchedules.schedule2,
      scheduledAt: new Date('2026-03-15T10:00:00'),
      location: 'Phòng họp B - Tầng 2',
      meetingLink: 'https://meet.google.com/klm-nopq-rst',
      candidateId: ids.candidates.candidate7,
      interviewerIds: [ids.employees.nguyenAn],
    },
  ]

  for (const item of items) {
    const { interviewerIds, ...scheduleData } = item

    await prisma.interviewSchedule.upsert({
      where: { id: item.id },
      update: scheduleData,
      create: scheduleData,
    })

    // Connect interviewers
    await prisma.interviewSchedule.update({
      where: { id: item.id },
      data: {
        interviewers: {
          set: interviewerIds.map((id) => ({ id })),
        },
      },
    })
  }
}
