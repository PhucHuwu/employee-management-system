import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';

@Module({
  imports: [AuditModule],
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillModule {}
