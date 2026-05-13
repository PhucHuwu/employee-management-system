import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';

@Module({
  imports: [AuditModule],
  controllers: [BranchController],
  providers: [BranchService],
})
export class BranchModule {}
