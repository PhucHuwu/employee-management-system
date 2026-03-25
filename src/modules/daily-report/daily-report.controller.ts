import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { Roles } from '@/modules/identity/decorators/roles.decorator';
import { DailyReportQueryDto } from './dto/daily-report-query.dto';
import { ProjectDailyProgressQueryDto } from './dto/project-daily-progress-query.dto';
import { DailyReportService } from './daily-report.service';

@Controller()
@Roles(Role.ADMIN, Role.MANAGER)
export class DailyReportController {
  constructor(private readonly dailyReportService: DailyReportService) {}

  @Get('daily-reports')
  getDailyReports(
    @CurrentUser() user: AuthUser,
    @Query() query: DailyReportQueryDto,
  ): Promise<unknown> {
    return this.dailyReportService.getDailyReports(user, query);
  }

  @Get('projects/:projectId/daily-progress')
  getProjectDailyProgress(
    @CurrentUser() user: AuthUser,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Query() query: ProjectDailyProgressQueryDto,
  ): Promise<unknown> {
    return this.dailyReportService.getProjectDailyProgress(user, projectId, query);
  }
}
