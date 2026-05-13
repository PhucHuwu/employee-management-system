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
import { OffDayService } from './off-day.service';
import { CreateOffDayDto } from './dto/create-off-day.dto';
import { UpdateOffDayDto } from './dto/update-off-day.dto';

@Controller('off-days')
export class OffDayController {
  constructor(private readonly offDayService: OffDayService) {}

  @Post()
  create(@Body() dto: CreateOffDayDto) {
    return this.offDayService.create(dto);
  }

  @Get()
  findAll() {
    return this.offDayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.offDayService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOffDayDto,
  ) {
    return this.offDayService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.offDayService.remove(id);
  }
}
