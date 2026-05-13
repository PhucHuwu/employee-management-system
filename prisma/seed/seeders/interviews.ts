import { InterviewResult } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedInterviews = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.interviews.interview1,
      scheduledAt: new Date('2026-03-10T09:00:00'),
      round: 1,
      interviewer: 'Nguyễn Văn An',
      result: InterviewResult.PASSED,
      score: 85,
      notes: 'Kiến thức tốt, giao tiếp tốt',
      candidateId: ids.candidates.candidate2,
    },
    {
      id: ids.interviews.interview2,
      scheduledAt: new Date('2026-03-12T14:00:00'),
      round: 2,
      interviewer: 'Trần Thị Bình',
      result: InterviewResult.FAILED,
      score: 60,
      notes: 'Thiếu kinh nghiệm thực tế',
      candidateId: ids.candidates.candidate4,
    },
    {
      id: ids.interviews.interview3,
      scheduledAt: new Date('2026-03-15T10:00:00'),
      round: 1,
      interviewer: 'Nguyễn Văn An',
      result: InterviewResult.PENDING,
      candidateId: ids.candidates.candidate7,
    },
  ]

  for (const item of items) {
    await prisma.interview.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
