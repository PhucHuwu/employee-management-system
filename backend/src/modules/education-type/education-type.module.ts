import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { EducationTypeController } from './education-type.controller';
import { EducationTypeService } from './education-type.service';

@Module({
  imports: [AuditModule],
  controllers: [EducationTypeController],
  providers: [EducationTypeService],
})
export class EducationTypeModule {}
