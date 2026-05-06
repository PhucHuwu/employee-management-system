import { Controller, Get, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '@/modules/identity/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { RevenueQueryDto, ResourceUtilizationQueryDto } from './dto/analytics-query.dto';

@Controller('analytics')
@Roles(Role.ADMIN, Role.MANAGER)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard-summary')
  async getDashboardSummary(): Promise<ReturnType<AnalyticsService['getDashboardSummary']>> {
    return this.analyticsService.getDashboardSummary();
  }

  @Get('exception-reports')
  async getExceptionReports(): Promise<ReturnType<AnalyticsService['getExceptionReports']>> {
    return this.analyticsService.getExceptionReports();
  }

  @Get('revenue')
  async getRevenue(@Query() query: RevenueQueryDto): Promise<ReturnType<AnalyticsService['getRevenue']>> {
    return this.analyticsService.getRevenue(query);
  }

  @Get('resource-utilization')
  async getResourceUtilization(@Query() query: ResourceUtilizationQueryDto): Promise<ReturnType<AnalyticsService['getResourceUtilization']>> {
    return this.analyticsService.getResourceUtilization();
  }
}
