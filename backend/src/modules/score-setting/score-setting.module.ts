import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { ScoreSettingController } from './score-setting.controller';
import { ScoreSettingService } from './score-setting.service';

@Module({
  imports: [AuditModule],
  controllers: [ScoreSettingController],
  providers: [ScoreSettingService],
})
export class ScoreSettingModule {}
