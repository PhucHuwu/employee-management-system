import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { DailyReportModule } from './modules/daily-report/daily-report.module';
import { ProjectModule } from './modules/project/project.module';
import { PositionModule } from './modules/position/position.module';
import { JobTitleModule } from './modules/job-title/job-title.module';
import { AuditModule } from './modules/audit/audit.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AppConfigService } from './config/app-config.service';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    IdentityModule,
    EmployeeModule,
    ScheduleModule,
    DailyReportModule,
    ProjectModule,
    PositionModule,
    JobTitleModule,
    AuditModule,
  ],
  providers: [AppConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
