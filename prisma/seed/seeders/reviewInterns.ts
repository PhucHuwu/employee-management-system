import { ReviewInternStatus } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedReviewInterns = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId } = ctx

  const items = [
    {
      id: ids.reviewInterns.review1,
      month: 4,
      year: 2026,
      totalScore: 82.5,
      level: 'Đạt yêu cầu',
      status: ReviewInternStatus.APPROVED,
      internId: ids.employees.hoangEm,
      reviewerId: ids.employees.nguyenAn,
      details: [
        { capabilityId: ids.capabilities.codeQuality, score: 80, comment: 'Code tốt, cần thêm unit test' },
        { capabilityId: ids.capabilities.teamwork, score: 85, comment: 'Hòa đồng, hỗ trợ tốt' },
        { capabilityId: ids.capabilities.communication, score: 75, comment: 'Cần chủ động báo cáo hơn' },
      ],
    },
    {
      id: ids.reviewInterns.review2,
      month: 4,
      year: 2026,
      totalScore: 91,
      level: 'Xuất sắc',
      status: ReviewInternStatus.REVIEWED,
      internId: ids.employees.ngoPhuong,
      reviewerId: ids.employees.nguyenAn,
      details: [
        { capabilityId: ids.capabilities.codeQuality, score: 90, comment: 'Xuất sắc' },
        { capabilityId: ids.capabilities.problemSolving, score: 92, comment: 'Giải quyết vấn đề rất tốt' },
        { capabilityId: ids.capabilities.learningAbility, score: 95, comment: 'Học hỏi rất nhanh' },
      ],
    },
    {
      id: ids.reviewInterns.review3,
      month: 3,
      year: 2026,
      totalScore: null,
      level: null,
      status: ReviewInternStatus.DRAFT,
      internId: ids.employees.hoangEm,
      reviewerId: ids.employees.nguyenAn,
      details: [],
    },
  ]

  let detailIndex = 1
  for (const item of items) {
    const { details, ...reviewData } = item

    await prisma.reviewIntern.upsert({
      where: { id: item.id },
      update: reviewData,
      create: reviewData,
    })

    for (const detail of details) {
      await prisma.reviewInternDetail.upsert({
        where: {
          reviewInternId_capabilityId: {
            reviewInternId: item.id,
            capabilityId: detail.capabilityId,
          },
        },
        update: {
          score: detail.score,
          comment: detail.comment,
        },
        create: {
          id: makeId('96500000', detailIndex++),
          score: detail.score,
          comment: detail.comment,
          reviewInternId: item.id,
          capabilityId: detail.capabilityId,
        },
      })
    }
  }
}
