import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { ExpenseClaimController } from './expense-claim.controller';
import { ExpenseClaimService } from './expense-claim.service';

@Module({
  imports: [AuditModule],
  controllers: [ExpenseClaimController],
  providers: [ExpenseClaimService],
  exports: [ExpenseClaimService],
})
export class ExpenseClaimModule {}
