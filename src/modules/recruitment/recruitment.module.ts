import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import {
  JobRequisitionController,
  CandidateController,
  InterviewController,
} from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';

@Module({
  imports: [AuditModule],
  controllers: [JobRequisitionController, CandidateController, InterviewController],
  providers: [RecruitmentService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
