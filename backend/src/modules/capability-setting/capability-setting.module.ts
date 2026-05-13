import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { CapabilitySettingController } from './capability-setting.controller';
import { CapabilitySettingService } from './capability-setting.service';

@Module({
  imports: [AuditModule],
  controllers: [CapabilitySettingController],
  providers: [CapabilitySettingService],
})
export class CapabilitySettingModule {}
