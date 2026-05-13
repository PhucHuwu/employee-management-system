import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { CvSourceController } from './cv-source.controller';
import { CvSourceService } from './cv-source.service';

@Module({
  imports: [AuditModule],
  controllers: [CvSourceController],
  providers: [CvSourceService],
})
export class CvSourceModule {}
