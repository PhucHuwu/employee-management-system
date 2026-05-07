import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ExpenseClaimStatus } from '@prisma/client';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { ExpenseClaimService } from './expense-claim.service';
import { CreateExpenseClaimDto } from './dto/create-expense-claim.dto';
import { UpdateExpenseClaimDto } from './dto/update-expense-claim.dto';
import { ApproveExpenseClaimDto } from './dto/approve-expense-claim.dto';

@Controller('expense-claims')
export class ExpenseClaimController {
  constructor(private readonly expenseClaimService: ExpenseClaimService) {}

  @Post()
  @Permissions({ resource: 'expense-claim', action: 'create' })
  create(
    @CurrentUser() _user: AuthUser,
    @Body() dto: CreateExpenseClaimDto,
  ) {
    return this.expenseClaimService.create(dto);
  }

  @Get()
  @Permissions({ resource: 'expense-claim', action: 'read' })
  findAll(
    @CurrentUser() _user: AuthUser,
    @Query('page') page = '1',
    @Query('size') size = '20',
    @Query('status') status?: ExpenseClaimStatus,
    @Query('projectId') projectId?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.expenseClaimService.findAll({
      page: Number(page),
      size: Number(size),
      status,
      projectId,
      employeeId,
    });
  }

  @Get(':id')
  @Permissions({ resource: 'expense-claim', action: 'read' })
  findOne(
    @CurrentUser() _user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.expenseClaimService.findOne(id);
  }

  @Put(':id')
  @Permissions({ resource: 'expense-claim', action: 'update' })
  update(
    @CurrentUser() _user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateExpenseClaimDto,
  ) {
    return this.expenseClaimService.update(id, dto);
  }

  @Post(':id/approve')
  @Permissions({ resource: 'expense-claim', action: 'update' })
  approve(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.expenseClaimService.approve(id, user.id);
  }

  @Post(':id/reject')
  @Permissions({ resource: 'expense-claim', action: 'update' })
  reject(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ApproveExpenseClaimDto,
  ) {
    return this.expenseClaimService.reject(id, dto.rejectionReason, user.id);
  }
}
