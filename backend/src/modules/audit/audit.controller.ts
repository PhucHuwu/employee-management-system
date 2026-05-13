import { Controller, Get, Query } from '@nestjs/common';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AuditService } from './audit.service';

@Controller('internal/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Permissions({ resource: 'audit-log', action: 'read' })
  getAuditLogs(@Query() query: AuditQueryDto) {
    return this.auditService.findLogs(query);
  }
}
