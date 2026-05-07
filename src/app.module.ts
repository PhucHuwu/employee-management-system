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
import { DepartmentModule } from './modules/department/department.module';
import { AuditModule } from './modules/audit/audit.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { LeaveModule } from './modules/leave/leave.module';
import { TrainingModule } from './modules/training/training.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ProjectBudgetModule } from './modules/project-budget/project-budget.module';
import { ExpenseClaimModule } from './modules/expense-claim/expense-claim.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { BranchModule } from './modules/branch/branch.module';
import { EducationTypeModule } from './modules/education-type/education-type.module';
import { EducationModule } from './modules/education/education.module';
import { SkillModule } from './modules/skill/skill.module';
import { CapabilityModule } from './modules/capability/capability.module';
import { CapabilitySettingModule } from './modules/capability-setting/capability-setting.module';
import { ScoreSettingModule } from './modules/score-setting/score-setting.module';
import { InterviewScheduleModule } from './modules/interview-schedule/interview-schedule.module';
import { ProjectTaskModule } from './modules/project-task/project-task.module';
import { TimesheetEntryModule } from './modules/timesheet-entry/timesheet-entry.module';
import { ReviewInternModule } from './modules/review-intern/review-intern.module';
import { TeamBuildingRequestModule } from './modules/team-building-request/team-building-request.module';
import { WorkingTimeRequestModule } from './modules/working-time-request/working-time-request.module';
import { OnsiteRequestModule } from './modules/onsite-request/onsite-request.module';
import { SystemSettingModule } from './modules/system-setting/system-setting.module';
import { LeaveTypeModule } from './modules/leave-type/leave-type.module';
import { OffDayModule } from './modules/off-day/off-day.module';
import { ProjectMemberShadowModule } from './modules/project-member-shadow/project-member-shadow.module';
import { CvSourceModule } from './modules/cv-source/cv-source.module';
import { SubPositionModule } from './modules/sub-position/sub-position.module';
import { PositionSettingModule } from './modules/position-setting/position-setting.module';
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
    DepartmentModule,
    AuditModule,
    AnalyticsModule,
    LeaveModule,
    TrainingModule,
    RecruitmentModule,
    PayrollModule,
    ProjectBudgetModule,
    ExpenseClaimModule,
    InvoiceModule,
    BranchModule,
    EducationTypeModule,
    EducationModule,
    SkillModule,
    CvSourceModule,
    SubPositionModule,
    PositionSettingModule,
    CapabilityModule,
    CapabilitySettingModule,
    ScoreSettingModule,
    InterviewScheduleModule,
    ProjectTaskModule,
    TimesheetEntryModule,
    ReviewInternModule,
    TeamBuildingRequestModule,
    WorkingTimeRequestModule,
    OnsiteRequestModule,
    SystemSettingModule,
    LeaveTypeModule,
    OffDayModule,
    ProjectMemberShadowModule,
  ],
  providers: [AppConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
