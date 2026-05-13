import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import {
  JobRequisitionController,
  CandidateController,
  InterviewController,
  RecruitmentReportController,
} from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';

@Module({
  imports: [AuditModule],
  controllers: [JobRequisitionController, CandidateController, InterviewController, RecruitmentReportController],
  providers: [RecruitmentService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
