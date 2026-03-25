import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Body,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { Roles } from '@/modules/identity/decorators/roles.decorator';
import { DailyDrilldownQueryDto } from './dto/daily-drilldown-query.dto';
import { DailySummaryQueryDto } from './dto/daily-summary-query.dto';
import { RejectScheduleRequestDto } from './dto/reject-schedule-request.dto';
import { ScheduleRequestQueryDto } from './dto/schedule-request-query.dto';
import { ScheduleService } from './schedule.service';

@Controller()
@Roles(Role.ADMIN, Role.MANAGER)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('schedule-requests')
  getScheduleRequests(
    @CurrentUser() user: AuthUser,
    @Query() query: ScheduleRequestQueryDto,
  ): Promise<unknown> {
    return this.scheduleService.getScheduleRequests(user, query);
  }

  @Post('schedule-requests/:id/approve')
  approveRequest(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) requestId: string,
  ): Promise<unknown> {
    return this.scheduleService.approveRequest(user, requestId);
  }

  @Post('schedule-requests/:id/reject')
  rejectRequest(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) requestId: string,
    @Body() body: RejectScheduleRequestDto,
  ): Promise<unknown> {
    return this.scheduleService.rejectRequest(user, requestId, body.rejectionReason);
  }

  @Get('schedules/daily-summary')
  getDailySummary(
    @CurrentUser() user: AuthUser,
    @Query() query: DailySummaryQueryDto,
  ): Promise<unknown> {
    return this.scheduleService.getDailySummary(user, query);
  }

  @Get('schedules/daily-drilldown')
  getDailyDrilldown(
    @CurrentUser() user: AuthUser,
    @Query() query: DailyDrilldownQueryDto,
  ): Promise<unknown> {
    return this.scheduleService.getDailyDrilldown(user, query);
  }
}
