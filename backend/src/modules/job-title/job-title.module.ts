import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { JobTitleController } from './job-title.controller';
import { JobTitleService } from './job-title.service';

@Module({
  imports: [AuditModule],
  controllers: [JobTitleController],
  providers: [JobTitleService],
})
export class JobTitleModule {}
