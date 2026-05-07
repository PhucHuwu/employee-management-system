import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { WorkingTimeRequestService } from './working-time-request.service';
import { CreateWorkingTimeRequestDto } from './dto/create-working-time-request.dto';

@Controller('working-time-requests')
export class WorkingTimeRequestController {
  constructor(private readonly workingTimeRequestService: WorkingTimeRequestService) {}

  @Post()
  create(@Body() dto: CreateWorkingTimeRequestDto) {
    // TODO: extract employeeId from auth context
    return this.workingTimeRequestService.create(dto, '');
  }

  @Get()
  findAll(@Query('employeeId') employeeId?: string) {
    return this.workingTimeRequestService.findAll(employeeId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workingTimeRequestService.findOne(id);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.workingTimeRequestService.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.workingTimeRequestService.reject(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workingTimeRequestService.remove(id);
  }
}
