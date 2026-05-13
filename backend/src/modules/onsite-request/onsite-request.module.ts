import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { OnsiteRequestController } from './onsite-request.controller';
import { OnsiteRequestService } from './onsite-request.service';

@Module({
  imports: [AuditModule],
  controllers: [OnsiteRequestController],
  providers: [OnsiteRequestService],
})
export class OnsiteRequestModule {}
