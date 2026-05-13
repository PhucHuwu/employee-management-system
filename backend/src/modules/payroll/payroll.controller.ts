import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { PayrollService } from './payroll.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';
import { UpdatePayrollItemDto } from './dto/update-payroll-item.dto';
import { PayrollQueryDto } from './dto/payroll-query.dto';

@Controller()
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // ─── Salary Structures ────────────────────────────────────────────

  @Post('salary-structures')
  @Permissions({ resource: 'payroll', action: 'create' })
  createSalaryStructure(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSalaryStructureDto,
  ) {
    return this.payrollService.createSalaryStructure(user, dto);
  }

  @Get('salary-structures')
  @Permissions({ resource: 'payroll', action: 'read' })
  listSalaryStructures(@Query('employeeId') employeeId?: string) {
    return this.payrollService.listSalaryStructures(employeeId);
  }

  @Get('salary-structures/:id')
  @Permissions({ resource: 'payroll', action: 'read' })
  getSalaryStructure(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.getSalaryStructureById(id);
  }

  @Put('salary-structures/:id')
  @Permissions({ resource: 'payroll', action: 'update' })
  updateSalaryStructure(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalaryStructureDto,
  ) {
    return this.payrollService.updateSalaryStructure(user, id, dto);
  }

  @Delete('salary-structures/:id')
  @Permissions({ resource: 'payroll', action: 'delete' })
  deleteSalaryStructure(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payrollService.deleteSalaryStructure(user, id);
  }

  // ─── Payrolls ─────────────────────────────────────────────────────

  @Post('payrolls')
  @Permissions({ resource: 'payroll', action: 'create' })
  createPayroll(@CurrentUser() user: AuthUser, @Body() dto: CreatePayrollDto) {
    return this.payrollService.createPayroll(user, dto);
  }

  @Get('payrolls')
  @Permissions({ resource: 'payroll', action: 'read' })
  listPayrolls(@Query() query: PayrollQueryDto) {
    return this.payrollService.listPayrolls(query);
  }

  @Get('payrolls/:id')
  @Permissions({ resource: 'payroll', action: 'read' })
  getPayroll(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.getPayrollById(id);
  }

  @Post('payrolls/:id/calculate')
  @Permissions({ resource: 'payroll', action: 'update' })
  calculatePayroll(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CalculatePayrollDto,
  ) {
    return this.payrollService.calculatePayroll(user, id, dto);
  }

  @Put('payrolls/:id/approve')
  @Permissions({ resource: 'payroll', action: 'update' })
  approvePayroll(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payrollService.approvePayroll(user, id);
  }

  @Put('payrolls/:id/pay')
  @Permissions({ resource: 'payroll', action: 'update' })
  payPayroll(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payrollService.payPayroll(user, id);
  }

  @Put('payrolls/:payrollId/items/:itemId')
  @Permissions({ resource: 'payroll', action: 'update' })
  updatePayrollItem(
    @CurrentUser() user: AuthUser,
    @Param('payrollId', ParseUUIDPipe) payrollId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdatePayrollItemDto,
  ) {
    return this.payrollService.updatePayrollItem(user, payrollId, itemId, dto);
  }
}
