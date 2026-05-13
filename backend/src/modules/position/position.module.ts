import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';

@Module({
  imports: [AuditModule],
  controllers: [PositionController],
  providers: [PositionService],
})
export class PositionModule {}
