import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { PositionSettingController } from './position-setting.controller';
import { PositionSettingService } from './position-setting.service';

@Module({
  imports: [AuditModule],
  controllers: [PositionSettingController],
  providers: [PositionSettingService],
})
export class PositionSettingModule {}
