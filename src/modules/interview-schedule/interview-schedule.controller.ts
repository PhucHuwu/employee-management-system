import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { InterviewScheduleService } from './interview-schedule.service';
import { CreateInterviewScheduleDto } from './dto/create-interview-schedule.dto';
import { UpdateInterviewScheduleDto } from './dto/update-interview-schedule.dto';

@Controller('interview-schedules')
export class InterviewScheduleController {
  constructor(private readonly interviewScheduleService: InterviewScheduleService) {}

  @Post()
  create(@Body() dto: CreateInterviewScheduleDto) {
    return this.interviewScheduleService.create(dto);
  }

  @Get()
  findAll() {
    return this.interviewScheduleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.interviewScheduleService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInterviewScheduleDto,
  ) {
    return this.interviewScheduleService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.interviewScheduleService.remove(id);
  }
}
