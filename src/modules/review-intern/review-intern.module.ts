import { Module } from '@nestjs/common';
import { ReviewInternController } from './review-intern.controller';
import { ReviewInternService } from './review-intern.service';
import { AuditService } from '@/modules/audit/audit.service';

@Module({
  controllers: [ReviewInternController],
  providers: [ReviewInternService, AuditService],
})
export class ReviewInternModule {}
