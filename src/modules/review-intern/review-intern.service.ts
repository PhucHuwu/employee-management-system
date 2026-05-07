import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateReviewInternDto, ReviewInternDetailInput } from './dto/create-review-intern.dto';
import { UpdateReviewInternDto } from './dto/update-review-intern.dto';

@Injectable()
export class ReviewInternService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewInternDto) {
    return this.prisma.reviewIntern.create({
      data: {
        month: dto.month,
        year: dto.year,
        internId: dto.internId,
        reviewerId: dto.reviewerId,
        details: dto.details
          ? { create: dto.details.map((d) => ({ capabilityId: d.capabilityId, score: d.score ?? null, comment: d.comment ?? null })) }
          : undefined,
      },
      include: { intern: true, reviewer: true, details: { include: { capability: true } } },
    });
  }

  async findAll(reviewerId?: string, internId?: string) {
    return this.prisma.reviewIntern.findMany({
      where: {
        ...(reviewerId ? { reviewerId } : {}),
        ...(internId ? { internId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { intern: true, reviewer: true, details: { include: { capability: true } } },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.reviewIntern.findUnique({
      where: { id },
      include: { intern: true, reviewer: true, details: { include: { capability: true } } },
    });
    if (!item) throw new NotFoundException('Review intern not found');
    return item;
  }

  async update(id: string, dto: UpdateReviewInternDto) {
    await this.findOne(id);
    return this.prisma.reviewIntern.update({
      where: { id },
      data: {
        totalScore: dto.totalScore,
        level: dto.level?.trim() ?? null,
        details: dto.details
          ? { deleteMany: {}, create: dto.details.map((d) => ({ capabilityId: d.capabilityId, score: d.score ?? null, comment: d.comment ?? null })) }
          : undefined,
      },
      include: { intern: true, reviewer: true, details: { include: { capability: true } } },
    });
  }

  async submitReview(id: string) {
    const item = await this.findOne(id);
    if (item.status !== 'DRAFT') {
      throw new BadRequestException('Only draft reviews can be submitted');
    }
    return this.prisma.reviewIntern.update({
      where: { id },
      data: { status: 'REVIEWED' },
      include: { intern: true, reviewer: true, details: { include: { capability: true } } },
    });
  }

  async approve(id: string) {
    const item = await this.findOne(id);
    if (item.status !== 'REVIEWED') {
      throw new BadRequestException('Only reviewed items can be approved');
    }
    return this.prisma.reviewIntern.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { intern: true, reviewer: true, details: { include: { capability: true } } },
    });
  }

  async reject(id: string) {
    const item = await this.findOne(id);
    if (item.status !== 'REVIEWED') {
      throw new BadRequestException('Only reviewed items can be rejected');
    }
    return this.prisma.reviewIntern.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: { intern: true, reviewer: true, details: { include: { capability: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.reviewIntern.delete({ where: { id } });
  }
}
