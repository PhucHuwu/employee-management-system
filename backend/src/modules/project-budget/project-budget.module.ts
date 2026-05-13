import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { ProjectBudgetController } from './project-budget.controller';
import { ProjectBudgetService } from './project-budget.service';

@Module({
  imports: [AuditModule],
  controllers: [ProjectBudgetController],
  providers: [ProjectBudgetService],
  exports: [ProjectBudgetService],
})
export class ProjectBudgetModule {}
