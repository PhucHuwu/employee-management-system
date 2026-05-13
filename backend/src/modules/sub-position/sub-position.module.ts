import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { SubPositionController } from './sub-position.controller';
import { SubPositionService } from './sub-position.service';

@Module({
  imports: [AuditModule],
  controllers: [SubPositionController],
  providers: [SubPositionService],
})
export class SubPositionModule {}
