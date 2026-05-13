import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CustomerQueryDto } from '../dto/customer-query.dto';
import { LinkCustomerDto } from '../dto/link-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async listCustomers(query: CustomerQueryDto) {
    const where: Prisma.CustomerWhereInput = {};

    if (query.keyword?.trim()) {
      const keyword = query.keyword.trim();
      where.OR = [
        { companyName: { contains: keyword, mode: 'insensitive' } },
        { taxCode: { contains: keyword, mode: 'insensitive' } },
        { contactName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.size;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        skip,
        take: query.size,
        orderBy: { companyName: 'asc' },
        include: {
          _count: {
            select: {
              projects: true,
            },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        size: query.size,
        total,
      },
    };
  }

  async createCustomer(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        companyName: dto.companyName.trim(),
        taxCode: dto.taxCode?.trim(),
        businessAddress: dto.businessAddress?.trim(),
        contactAddress: dto.contactAddress?.trim(),
        country: dto.country?.trim(),
        city: dto.city?.trim(),
        contactName: dto.contactName?.trim(),
        contactTitle: dto.contactTitle?.trim(),
        contactEmail: dto.contactEmail?.trim().toLowerCase(),
        contactPhone: dto.contactPhone?.trim(),
        paymentTerms: dto.paymentTerms?.trim(),
        notes: dto.notes?.trim(),
        cooperationStatus: dto.cooperationStatus?.trim(),
      },
    });
  }

  async getCustomerById(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        projects: {
          include: {
            project: {
              select: {
                id: true,
                code: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('customer not found');
    }

    return customer;
  }

  async updateCustomer(customerId: string, dto: UpdateCustomerDto) {
    await this.ensureCustomerExists(customerId);

    const oldCustomer = await this.prisma.customer.findUniqueOrThrow({ where: { id: customerId } });
    const updated = await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        companyName: dto.companyName?.trim(),
        taxCode: dto.taxCode?.trim(),
        businessAddress: dto.businessAddress?.trim(),
        contactAddress: dto.contactAddress?.trim(),
        country: dto.country?.trim(),
        city: dto.city?.trim(),
        contactName: dto.contactName?.trim(),
        contactTitle: dto.contactTitle?.trim(),
        contactEmail: dto.contactEmail?.trim().toLowerCase(),
        contactPhone: dto.contactPhone?.trim(),
        paymentTerms: dto.paymentTerms?.trim(),
        notes: dto.notes?.trim(),
        cooperationStatus: dto.cooperationStatus?.trim(),
      },
    });

    await this.auditLogService.log({
      action: 'CUSTOMER_UPDATED',
      entityType: 'Customer',
      entityId: updated.id,
      oldData: oldCustomer,
      newData: updated,
    });

    return updated;
  }

  async deleteCustomer(customerId: string) {
    await this.ensureCustomerExists(customerId);

    const linkedCount = await this.prisma.projectCustomer.count({ where: { customerId } });
    if (linkedCount > 0) {
      throw new ConflictException('cannot delete customer while linked to projects');
    }

    const deleted = await this.prisma.customer.delete({ where: { id: customerId } });

    await this.auditLogService.log({
      action: 'CUSTOMER_DELETED',
      entityType: 'Customer',
      entityId: deleted.id,
      oldData: deleted,
    });

    return { deleted: true };
  }

  async linkCustomerToProject(projectId: string, dto: LinkCustomerDto) {
    await this.ensureProjectExists(projectId);
    await this.ensureCustomerExists(dto.customerId);

    try {
      const linked = await this.prisma.projectCustomer.create({
        data: {
          projectId,
          customerId: dto.customerId,
        },
        include: {
          customer: true,
        },
      });

      await this.auditLogService.log({
        action: 'PROJECT_CUSTOMER_LINKED',
        entityType: 'ProjectCustomer',
        entityId: linked.id,
        newData: linked,
      });

      return linked;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('customer is already linked to this project');
      }
      throw error;
    }
  }

  async unlinkCustomerFromProject(projectId: string, customerId: string) {
    await this.ensureProjectExists(projectId);
    await this.ensureCustomerExists(customerId);

    const link = await this.prisma.projectCustomer.findUnique({
      where: {
        projectId_customerId: {
          projectId,
          customerId,
        },
      },
    });

    if (!link) {
      throw new NotFoundException('project-customer link not found');
    }

    await this.prisma.projectCustomer.delete({ where: { id: link.id } });

    await this.auditLogService.log({
      action: 'PROJECT_CUSTOMER_UNLINKED',
      entityType: 'ProjectCustomer',
      entityId: link.id,
      oldData: link,
    });

    return { deleted: true };
  }

  private async ensureProjectExists(projectId: string): Promise<void> {
    const exists = await this.prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('project not found');
    }
  }

  private async ensureCustomerExists(customerId: string): Promise<void> {
    const exists = await this.prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('customer not found');
    }
  }
}
