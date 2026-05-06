import { Controller, Get, Query } from '@nestjs/common';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { AnalyticsService } from './analytics.service';
import { RevenueQueryDto, ResourceUtilizationQueryDto } from './dto/analytics-query.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard-summary')
  @Permissions({ resource: 'analytics', action: 'read' })
  async getDashboardSummary(): Promise<ReturnType<AnalyticsService['getDashboardSummary']>> {
    return this.analyticsService.getDashboardSummary();
  }

  @Get('exception-reports')
  @Permissions({ resource: 'analytics', action: 'read' })
  async getExceptionReports(): Promise<ReturnType<AnalyticsService['getExceptionReports']>> {
    return this.analyticsService.getExceptionReports();
  }

  @Get('revenue')
  @Permissions({ resource: 'analytics', action: 'read' })
  async getRevenue(@Query() query: RevenueQueryDto): Promise<ReturnType<AnalyticsService['getRevenue']>> {
    return this.analyticsService.getRevenue(query);
  }

  @Get('resource-utilization')
  @Permissions({ resource: 'analytics', action: 'read' })
  async getResourceUtilization(@Query() query: ResourceUtilizationQueryDto): Promise<ReturnType<AnalyticsService['getResourceUtilization']>> {
    return this.analyticsService.getResourceUtilization();
  }
}
