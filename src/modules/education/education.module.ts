import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';

@Module({
  imports: [AuditModule],
  controllers: [EducationController],
  providers: [EducationService],
})
export class EducationModule {}
