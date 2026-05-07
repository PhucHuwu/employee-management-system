import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { CapabilityController } from './capability.controller';
import { CapabilityService } from './capability.service';

@Module({
  imports: [AuditModule],
  controllers: [CapabilityController],
  providers: [CapabilityService],
})
export class CapabilityModule {}
