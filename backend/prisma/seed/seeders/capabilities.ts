import { CapabilityType } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedCapabilities = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.capabilities.codeQuality,
      name: 'Chất lượng code',
      from: 'Code review',
      guideline: 'Đánh giá độ sạch, tuân thủ convention, tái sử dụng',
      type: CapabilityType.POINT,
    },
    {
      id: ids.capabilities.teamwork,
      name: 'Làm việc nhóm',
      from: 'Peer feedback',
      guideline: 'Hỗ trợ đồng đội, chia sẻ kiến thức, phối hợp tốt',
      type: CapabilityType.POINT,
    },
    {
      id: ids.capabilities.communication,
      name: 'Giao tiếp',
      from: 'PM đánh giá',
      guideline: 'Trình bày rõ ràng, báo cáo kịp thời, phản hồi tích cực',
      type: CapabilityType.POINT,
    },
    {
      id: ids.capabilities.problemSolving,
      name: 'Giải quyết vấn đề',
      from: 'Task completion',
      guideline: 'Phân tích, debug, đề xuất giải pháp hiệu quả',
      type: CapabilityType.POINT,
    },
    {
      id: ids.capabilities.learningAbility,
      name: 'Khả năng học hỏi',
      from: 'Self assessment',
      guideline: 'Chủ động tìm hiểu công nghệ mới, áp dụng nhanh',
      type: CapabilityType.POINT,
    },
    {
      id: ids.capabilities.responsibility,
      name: 'Trách nhiệm',
      from: 'PM đánh giá',
      guideline: 'Hoàn thành đúng deadline, chịu trách nhiệm với output',
      type: CapabilityType.TEXT,
    },
  ]

  for (const item of items) {
    await prisma.capability.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
