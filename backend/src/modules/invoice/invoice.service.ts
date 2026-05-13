import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma, RevenueType } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';

interface AgingBucket {
  count: number;
  amount: number;
  invoices: Array<{
    id: string;
    invoiceDate: Date;
    dueDate: Date;
    totalAmount: Prisma.Decimal;
    status: InvoiceStatus;
    customerName: string;
    projectName: string;
    daysOverdue: number;
  }>;
}

interface AccountsReceivableReport {
  aging: {
    '0-30': AgingBucket;
    '31-60': AgingBucket;
    '61-90': AgingBucket;
    '>90': AgingBucket;
  };
  totalOutstanding: number;
}

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listInvoices(query: InvoiceQueryDto) {
    const where: Prisma.InvoiceWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.customerId) {
      where.customerId = query.customerId;
    }

    const skip = (query.page - 1) * query.size;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: query.size,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { companyName: true } },
          project: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      items: items.map((invoice) => ({
        ...invoice,
        customerName: invoice.customer.companyName,
        projectName: invoice.project.name,
      })),
      pagination: {
        page: query.page,
        size: query.size,
        total,
        totalPages: Math.ceil(total / query.size) || 1,
      },
    };
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        customer: { select: { companyName: true } },
        project: { select: { name: true } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return {
      ...invoice,
      customerName: invoice.customer.companyName,
      projectName: invoice.project.name,
    };
  }

  async createInvoice(dto: CreateInvoiceDto) {
    await this.assertProjectExists(dto.projectId);
    await this.assertCustomerExists(dto.customerId);

    if (new Date(dto.dueDate) < new Date(dto.invoiceDate)) {
      throw new BadRequestException('dueDate must be greater than or equal to invoiceDate');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Invoice must have at least one item');
    }

    const { subtotal, tax, totalAmount, itemsData } = this.calculateInvoiceTotals(dto.items);

    const invoice = await this.prisma.invoice.create({
      data: {
        projectId: dto.projectId,
        customerId: dto.customerId,
        invoiceDate: new Date(dto.invoiceDate),
        dueDate: new Date(dto.dueDate),
        taxAmount: tax,
        totalAmount,
        status: InvoiceStatus.DRAFT,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
        customer: { select: { companyName: true } },
        project: { select: { name: true } },
      },
    });

    return {
      ...invoice,
      customerName: invoice.customer.companyName,
      projectName: invoice.project.name,
    };
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto) {
    const existing = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }

    if (existing.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT invoices can be updated');
    }

    if (dto.projectId) {
      await this.assertProjectExists(dto.projectId);
    }
    if (dto.customerId) {
      await this.assertCustomerExists(dto.customerId);
    }

    if (dto.invoiceDate && dto.dueDate && new Date(dto.dueDate) < new Date(dto.invoiceDate)) {
      throw new BadRequestException('dueDate must be greater than or equal to invoiceDate');
    }

    const invoiceDate = dto.invoiceDate ? new Date(dto.invoiceDate) : existing.invoiceDate;
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : existing.dueDate;
    if (dueDate < invoiceDate) {
      throw new BadRequestException('dueDate must be greater than or equal to invoiceDate');
    }

    let taxAmount = existing.taxAmount;
    let totalAmount = existing.totalAmount;
    let itemsUpdate: Prisma.InvoiceItemUpdateManyWithoutInvoiceNestedInput | undefined;

    if (dto.items && dto.items.length > 0) {
      const totals = this.calculateInvoiceTotals(dto.items);
      taxAmount = totals.tax;
      totalAmount = totals.totalAmount;

      await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      itemsUpdate = {
        create: totals.itemsData,
      };
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        projectId: dto.projectId ?? undefined,
        customerId: dto.customerId ?? undefined,
        invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        taxAmount,
        totalAmount,
        items: itemsUpdate,
      },
      include: {
        items: true,
        customer: { select: { companyName: true } },
        project: { select: { name: true } },
      },
    });

    return {
      ...updated,
      customerName: updated.customer.companyName,
      projectName: updated.project.name,
    };
  }

  async deleteInvoice(id: string) {
    const existing = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }

    if (existing.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT invoices can be deleted');
    }

    await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await this.prisma.invoice.delete({ where: { id } });

    return { deleted: true };
  }

  async sendInvoice(user: AuthUser, id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT invoices can be sent');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.SENT,
        sentAt: new Date(),
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'INVOICE_SENT',
      entityType: 'Invoice',
      entityId: id,
      oldData: invoice,
      newData: updated,
    });

    return updated;
  }

  async payInvoice(user: AuthUser, id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.SENT && invoice.status !== InvoiceStatus.OVERDUE) {
      throw new BadRequestException('Only SENT or OVERDUE invoices can be paid');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'INVOICE_PAID',
      entityType: 'Invoice',
      entityId: id,
      oldData: invoice,
      newData: updated,
    });

    return updated;
  }

  async generateFromRevenue(user: AuthUser, dto: GenerateInvoiceDto) {
    await this.assertProjectExists(dto.projectId);

    const revenue = await this.prisma.projectRevenue.findFirst({
      where: {
        projectId: dto.projectId,
        periodMonth: dto.month,
        periodYear: dto.year,
        revenueType: RevenueType.ACTUAL,
      },
    });

    if (!revenue) {
      throw new NotFoundException('Actual revenue not found for this project/month/year');
    }

    let customerId = dto.customerId;
    if (!customerId) {
      const projectCustomer = await this.prisma.projectCustomer.findFirst({
        where: { projectId: dto.projectId },
      });
      if (!projectCustomer) {
        throw new BadRequestException('Project has no linked customer; provide customerId');
      }
      customerId = projectCustomer.customerId;
    }

    await this.assertCustomerExists(customerId);

    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const amount = new Prisma.Decimal(revenue.amount.toString());
    const tax = amount.mul(0.1);
    const total = amount.add(tax);

    const invoice = await this.prisma.invoice.create({
      data: {
        projectId: dto.projectId,
        customerId,
        invoiceDate,
        dueDate,
        taxAmount: tax,
        totalAmount: total,
        status: InvoiceStatus.DRAFT,
        items: {
          create: [
            {
              description: `Revenue ${dto.month}/${dto.year}`,
              quantity: 1,
              unitPrice: amount,
              amount,
            },
          ],
        },
      },
      include: {
        items: true,
        customer: { select: { companyName: true } },
        project: { select: { name: true } },
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'INVOICE_GENERATED_FROM_REVENUE',
      entityType: 'Invoice',
      entityId: invoice.id,
      newData: { projectId: dto.projectId, month: dto.month, year: dto.year, revenueId: revenue.id },
    });

    return {
      ...invoice,
      customerName: invoice.customer.companyName,
      projectName: invoice.project.name,
    };
  }

  async getAccountsReceivable(): Promise<AccountsReceivableReport> {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] },
      },
      include: {
        customer: { select: { companyName: true } },
        project: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const report: AccountsReceivableReport = {
      aging: {
        '0-30': { count: 0, amount: 0, invoices: [] },
        '31-60': { count: 0, amount: 0, invoices: [] },
        '61-90': { count: 0, amount: 0, invoices: [] },
        '>90': { count: 0, amount: 0, invoices: [] },
      },
      totalOutstanding: 0,
    };

    for (const invoice of invoices) {
      const due = new Date(invoice.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - due.getTime();
      const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      const bucketKey =
        daysOverdue <= 30 ? '0-30' : daysOverdue <= 60 ? '31-60' : daysOverdue <= 90 ? '61-90' : '>90';

      const totalAmount = Number(invoice.totalAmount);
      const bucket = report.aging[bucketKey];
      bucket.count += 1;
      bucket.amount += totalAmount;
      bucket.invoices.push({
        id: invoice.id,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
        customerName: invoice.customer.companyName,
        projectName: invoice.project.name,
        daysOverdue,
      });
      report.totalOutstanding += totalAmount;
    }

    return report;
  }

  private calculateInvoiceTotals(items: CreateInvoiceDto['items']) {
    let subtotal = new Prisma.Decimal(0);
    const itemsData: Prisma.InvoiceItemCreateWithoutInvoiceInput[] = [];

    for (const item of items) {
      const quantity = new Prisma.Decimal(item.quantity);
      const unitPrice = new Prisma.Decimal(item.unitPrice);
      const amount = quantity.mul(unitPrice);
      subtotal = subtotal.add(amount);
      itemsData.push({
        description: item.description,
        quantity: item.quantity,
        unitPrice,
        amount,
      });
    }

    const tax = subtotal.mul(0.1);
    const totalAmount = subtotal.add(tax);

    return { subtotal, tax, totalAmount, itemsData };
  }

  private async assertProjectExists(projectId: string): Promise<void> {
    const exists = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Project not found');
    }
  }

  private async assertCustomerExists(customerId: string): Promise<void> {
    const exists = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Customer not found');
    }
  }

  private toAuditActor(user: AuthUser): { id: string | null; role: import('@prisma/client').Role | null } {
    return {
      id: user?.id ?? null,
      role: user?.role ?? null,
    };
  }
}
