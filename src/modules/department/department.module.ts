import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';

@Module({
  imports: [AuditModule],
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule {}
