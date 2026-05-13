import { Controller, Get } from '@nestjs/common';
import { Public } from '../identity/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check(): { status: string; service: string } {
    return {
      status: 'ok',
      service: 'employee-management-system',
    };
  }
}
