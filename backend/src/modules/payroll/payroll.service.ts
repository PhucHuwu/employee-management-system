import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PayrollStatus, Prisma, Role, ScheduleRequestStatus, ScheduleRequestType } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';
import { UpdatePayrollItemDto } from './dto/update-payroll-item.dto';
import { PayrollQueryDto } from './dto/payroll-query.dto';

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ─── Salary Structure ─────────────────────────────────────────────

  async createSalaryStructure(user: AuthUser, dto: CreateSalaryStructureDto) {
    await this.assertEmployeeExists(dto.employeeId);

    const created = await this.prisma.$transaction(async (tx) => {
      const existingOpen = await tx.salaryStructure.findFirst({
        where: {
          employeeId: dto.employeeId,
          effectiveTo: null,
        },
      });

      if (existingOpen) {
        const newEffectiveFrom = new Date(dto.effectiveFrom);
        const dayBefore = new Date(newEffectiveFrom);
        dayBefore.setDate(dayBefore.getDate() - 1);

        await tx.salaryStructure.update({
          where: { id: existingOpen.id },
          data: { effectiveTo: dayBefore },
        });
      }

      return tx.salaryStructure.create({
        data: {
          baseSalary: new Prisma.Decimal(dto.baseSalary),
          allowance: dto.allowance ? new Prisma.Decimal(dto.allowance) : new Prisma.Decimal(0),
          bonus: dto.bonus ? new Prisma.Decimal(dto.bonus) : new Prisma.Decimal(0),
          effectiveFrom: dto.effectiveFrom,
          effectiveTo: dto.effectiveTo ?? null,
          employeeId: dto.employeeId,
        },
        include: { employee: { select: { fullName: true } } },
      });
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'SALARY_STRUCTURE_CREATED',
      entityType: 'SALARY_STRUCTURE',
      entityId: created.id,
      newData: created,
    });

    return created;
  }

  async getSalaryStructureById(id: string) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { id },
      include: { employee: { select: { fullName: true } } },
    });

    if (!structure) {
      throw new NotFoundException('Salary structure not found');
    }

    return structure;
  }

  async listSalaryStructures(employeeId?: string) {
    const where: Prisma.SalaryStructureWhereInput = {};
    if (employeeId) {
      where.employeeId = employeeId;
    }

    return this.prisma.salaryStructure.findMany({
      where,
      include: { employee: { select: { fullName: true } } },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async updateSalaryStructure(user: AuthUser, id: string, dto: UpdateSalaryStructureDto) {
    const existing = await this.prisma.salaryStructure.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Salary structure not found');
    }

    if (dto.employeeId) {
      await this.assertEmployeeExists(dto.employeeId);
    }

    const updated = await this.prisma.salaryStructure.update({
      where: { id },
      data: {
        baseSalary: dto.baseSalary !== undefined ? new Prisma.Decimal(dto.baseSalary) : undefined,
        allowance: dto.allowance !== undefined ? new Prisma.Decimal(dto.allowance) : undefined,
        bonus: dto.bonus !== undefined ? new Prisma.Decimal(dto.bonus) : undefined,
        effectiveFrom: dto.effectiveFrom ?? undefined,
        effectiveTo: dto.effectiveTo !== undefined ? dto.effectiveTo : undefined,
        employeeId: dto.employeeId ?? undefined,
      },
      include: { employee: { select: { fullName: true } } },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'SALARY_STRUCTURE_UPDATED',
      entityType: 'SALARY_STRUCTURE',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteSalaryStructure(user: AuthUser, id: string) {
    const existing = await this.prisma.salaryStructure.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Salary structure not found');
    }

    await this.prisma.salaryStructure.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'SALARY_STRUCTURE_DELETED',
      entityType: 'SALARY_STRUCTURE',
      entityId: id,
      oldData: existing,
    });

    return { deleted: true };
  }

  // ─── Payroll ──────────────────────────────────────────────────────

  async createPayroll(user: AuthUser, dto: CreatePayrollDto) {
    const existing = await this.prisma.payroll.findUnique({
      where: { month_year: { month: dto.month, year: dto.year } },
    });

    if (existing) {
      throw new BadRequestException('Payroll for this month and year already exists');
    }

    const created = await this.prisma.payroll.create({
      data: {
        month: dto.month,
        year: dto.year,
        status: PayrollStatus.DRAFT,
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'PAYROLL_CREATED',
      entityType: 'PAYROLL',
      entityId: created.id,
      newData: created,
    });

    return created;
  }

  async getPayrollById(id: string) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            employee: { select: { fullName: true } },
          },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    return payroll;
  }

  async listPayrolls(query: PayrollQueryDto) {
    const where: Prisma.PayrollWhereInput = {};
    if (query.month !== undefined) {
      where.month = query.month;
    }
    if (query.year !== undefined) {
      where.year = query.year;
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.payroll.count({ where }),
      this.prisma.payroll.findMany({
        where,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip: (query.page - 1) * query.size,
        take: query.size,
        include: {
          _count: { select: { items: true } },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        size: query.size,
        total,
        totalPages: Math.ceil(total / query.size) || 1,
      },
    };
  }

  async calculatePayroll(user: AuthUser, payrollId: string, dto: CalculatePayrollDto) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id: payrollId },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    if (payroll.status !== PayrollStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT payrolls can be calculated');
    }

    const activeEmployees = await this.prisma.employee.findMany({
      where: { employmentStatus: 'ACTIVE', deletedAt: null },
    });

    const startOfMonth = new Date(dto.year, dto.month - 1, 1);
    const endOfMonth = new Date(dto.year, dto.month, 0);

    const workingDays = 22;

    const updatedPayroll = await this.prisma.$transaction(async (tx) => {
      for (const employee of activeEmployees) {
        const salaryStructure = await tx.salaryStructure.findFirst({
          where: {
            employeeId: employee.id,
            effectiveFrom: { lte: endOfMonth },
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: startOfMonth } },
            ],
          },
          orderBy: { effectiveFrom: 'desc' },
        });

        if (!salaryStructure) {
          continue;
        }

        const leaveBalance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_year: {
              employeeId: employee.id,
              year: dto.year,
            },
          },
        });

        const scheduleRequests = await tx.scheduleRequest.findMany({
          where: {
            employeeId: employee.id,
            status: ScheduleRequestStatus.APPROVED,
            requestDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            requestType: {
              in: [
                ScheduleRequestType.OFF_FULL_DAY,
                ScheduleRequestType.OFF_AM,
                ScheduleRequestType.OFF_PM,
              ],
            },
          },
        });

        const fullDayOffs = scheduleRequests.filter(
          (r) => r.requestType === ScheduleRequestType.OFF_FULL_DAY,
        ).length;
        const halfDayOffs = scheduleRequests.filter(
          (r) =>
            r.requestType === ScheduleRequestType.OFF_AM ||
            r.requestType === ScheduleRequestType.OFF_PM,
        ).length;

        const actualDays = workingDays - fullDayOffs - 0.5 * halfDayOffs;

        const baseSalaryDecimal = new Decimal(salaryStructure.baseSalary.toString());
        const allowanceDecimal = new Decimal(salaryStructure.allowance.toString());
        const bonusDecimal = new Decimal(salaryStructure.bonus.toString());

        const baseSalary = baseSalaryDecimal.mul(actualDays / workingDays);
        const allowance = allowanceDecimal;
        const bonus = bonusDecimal;

        const unpaidTaken = leaveBalance ? leaveBalance.unpaidTaken : 0;
        const deductions = new Decimal(unpaidTaken).mul(baseSalaryDecimal.div(workingDays));

        const tax = baseSalary.mul(0.1);
        const netPay = baseSalary.add(allowance).add(bonus).sub(deductions).sub(tax);

        await tx.payrollItem.upsert({
          where: {
            payrollId_employeeId: {
              payrollId,
              employeeId: employee.id,
            },
          },
          create: {
            payrollId,
            employeeId: employee.id,
            baseSalary: new Prisma.Decimal(baseSalary.toFixed(2)),
            allowance: new Prisma.Decimal(allowance.toFixed(2)),
            bonus: new Prisma.Decimal(bonus.toFixed(2)),
            deductions: new Prisma.Decimal(deductions.toFixed(2)),
            tax: new Prisma.Decimal(tax.toFixed(2)),
            netPay: new Prisma.Decimal(netPay.toFixed(2)),
            workingDays,
            actualDays: Math.round(actualDays),
          },
          update: {
            baseSalary: new Prisma.Decimal(baseSalary.toFixed(2)),
            allowance: new Prisma.Decimal(allowance.toFixed(2)),
            bonus: new Prisma.Decimal(bonus.toFixed(2)),
            deductions: new Prisma.Decimal(deductions.toFixed(2)),
            tax: new Prisma.Decimal(tax.toFixed(2)),
            netPay: new Prisma.Decimal(netPay.toFixed(2)),
            workingDays,
            actualDays: Math.round(actualDays),
          },
        });
      }

      return tx.payroll.findUnique({
        where: { id: payrollId },
        include: {
          items: {
            include: {
              employee: { select: { fullName: true } },
            },
          },
        },
      });
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'PAYROLL_CALCULATED',
      entityType: 'PAYROLL',
      entityId: payrollId,
      newData: { month: dto.month, year: dto.year },
    });

    return updatedPayroll;
  }

  async approvePayroll(user: AuthUser, id: string) {
    const payroll = await this.prisma.payroll.findUnique({ where: { id } });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    if (payroll.status !== PayrollStatus.DRAFT && payroll.status !== PayrollStatus.PENDING) {
      throw new BadRequestException('Only DRAFT or PENDING payrolls can be approved');
    }

    const updated = await this.prisma.payroll.update({
      where: { id },
      data: {
        status: PayrollStatus.APPROVED,
        approvedAt: new Date(),
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'PAYROLL_APPROVED',
      entityType: 'PAYROLL',
      entityId: id,
      oldData: payroll,
      newData: updated,
    });

    return updated;
  }

  async payPayroll(user: AuthUser, id: string) {
    const payroll = await this.prisma.payroll.findUnique({ where: { id } });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    if (payroll.status !== PayrollStatus.APPROVED) {
      throw new BadRequestException('Only APPROVED payrolls can be paid');
    }

    const updated = await this.prisma.payroll.update({
      where: { id },
      data: {
        status: PayrollStatus.PAID,
        paidAt: new Date(),
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'PAYROLL_PAID',
      entityType: 'PAYROLL',
      entityId: id,
      oldData: payroll,
      newData: updated,
    });

    return updated;
  }

  async updatePayrollItem(
    user: AuthUser,
    payrollId: string,
    itemId: string,
    dto: UpdatePayrollItemDto,
  ) {
    const payroll = await this.prisma.payroll.findUnique({ where: { id: payrollId } });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    if (payroll.status !== PayrollStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT payroll items can be updated');
    }

    const existing = await this.prisma.payrollItem.findFirst({
      where: { id: itemId, payrollId },
    });

    if (!existing) {
      throw new NotFoundException('Payroll item not found');
    }

    const bonusDecimal =
      dto.bonus !== undefined ? new Decimal(dto.bonus) : new Decimal(existing.bonus.toString());
    const deductionsDecimal =
      dto.deductions !== undefined
        ? new Decimal(dto.deductions)
        : new Decimal(existing.deductions.toString());

    const baseSalary = new Decimal(existing.baseSalary.toString());
    const allowance = new Decimal(existing.allowance.toString());
    const tax = new Decimal(existing.tax.toString());

    const netPay = baseSalary.add(allowance).add(bonusDecimal).sub(deductionsDecimal).sub(tax);

    const updated = await this.prisma.payrollItem.update({
      where: { id: itemId },
      data: {
        bonus: new Prisma.Decimal(bonusDecimal.toFixed(2)),
        deductions: new Prisma.Decimal(deductionsDecimal.toFixed(2)),
        netPay: new Prisma.Decimal(netPay.toFixed(2)),
        notes: dto.notes ?? undefined,
      },
      include: {
        employee: { select: { fullName: true } },
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'PAYROLL_ITEM_UPDATED',
      entityType: 'PAYROLL_ITEM',
      entityId: itemId,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private async assertEmployeeExists(employeeId: string): Promise<void> {
    const exists = await this.prisma.employee.findUnique({
      where: { id: employeeId, deletedAt: null },
      select: { id: true },
    });

    if (!exists) {
      throw new BadRequestException('Employee does not exist');
    }
  }

  private toAuditActor(user: AuthUser): { id: string | null; role: Role | null } {
    return {
      id: user?.id ?? null,
      role: user?.role ?? null,
    };
  }
}
