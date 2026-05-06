import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { CreateDailyReportDto } from './dto/create-daily-report.dto';
import { DailyReportQueryDto } from './dto/daily-report-query.dto';
import { ProjectDailyProgressQueryDto } from './dto/project-daily-progress-query.dto';
import { UpdateDailyReportDto } from './dto/update-daily-report.dto';
import { DailyReportService } from './daily-report.service';

@Controller()
export class DailyReportController {
  constructor(private readonly dailyReportService: DailyReportService) {}

  @Get('daily-reports')
  @Permissions({ resource: 'daily-report', action: 'read' })
  getDailyReports(
    @CurrentUser() user: AuthUser,
    @Query() query: DailyReportQueryDto,
  ): Promise<unknown> {
    return this.dailyReportService.getDailyReports(user, query);
  }

  @Get('projects/:projectId/daily-progress')
  @Permissions({ resource: 'daily-report', action: 'read' })
  getProjectDailyProgress(
    @CurrentUser() user: AuthUser,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Query() query: ProjectDailyProgressQueryDto,
  ): Promise<unknown> {
    return this.dailyReportService.getProjectDailyProgress(user, projectId, query);
  }

  @Post('daily-reports')
  @Permissions({ resource: 'daily-report', action: 'create' })
  createDailyReport(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateDailyReportDto,
  ): Promise<unknown> {
    return this.dailyReportService.createDailyReport(user, dto);
  }

  @Put('daily-reports/:id')
  @Permissions({ resource: 'daily-report', action: 'update' })
  updateDailyReport(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDailyReportDto,
  ): Promise<unknown> {
    return this.dailyReportService.updateDailyReport(user, id, dto);
  }

  @Delete('daily-reports/:id')
  @Permissions({ resource: 'daily-report', action: 'delete' })
  deleteDailyReport(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.dailyReportService.deleteDailyReport(user, id);
  }
}
