import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { LeaveService } from './leave.service';
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';

@Controller('leave-balances')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get()
  @Permissions({ resource: 'leave-balance', action: 'read' })
  listLeaveBalances(
    @CurrentUser() _user: AuthUser,
    @Query('page') page = '1',
    @Query('size') size = '20',
  ) {
    return this.leaveService.listLeaveBalances({
      page: Number(page),
      size: Number(size),
    });
  }

  @Get(':employeeId/:year')
  @Permissions({ resource: 'leave-balance', action: 'read' })
  getLeaveBalance(
    @CurrentUser() _user: AuthUser,
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Param('year', new ParseIntPipe()) year: number,
  ) {
    return this.leaveService.getLeaveBalance(employeeId, year);
  }

  @Post()
  @Permissions({ resource: 'leave-balance', action: 'create' })
  createLeaveBalance(
    @CurrentUser() _user: AuthUser,
    @Body() dto: CreateLeaveBalanceDto,
  ) {
    return this.leaveService.createLeaveBalance(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'leave-balance', action: 'update' })
  updateLeaveBalance(
    @CurrentUser() _user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLeaveBalanceDto,
  ) {
    return this.leaveService.updateLeaveBalance(id, dto);
  }

  @Get(':employeeId/transactions')
  @Permissions({ resource: 'leave-balance', action: 'read' })
  listTransactions(
    @CurrentUser() _user: AuthUser,
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Query('page') page = '1',
    @Query('size') size = '20',
  ) {
    return this.leaveService.listTransactions(employeeId, {
      page: Number(page),
      size: Number(size),
    });
  }
}
