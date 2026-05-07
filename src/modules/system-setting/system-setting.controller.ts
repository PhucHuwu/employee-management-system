import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { SystemSettingService } from './system-setting.service';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@Controller('system-settings')
export class SystemSettingController {
  constructor(private readonly systemSettingService: SystemSettingService) {}

  @Post()
  create(@Body() dto: CreateSystemSettingDto) {
    return this.systemSettingService.create(dto);
  }

  @Get()
  findAll(@Query('category') category?: string) {
    return this.systemSettingService.findAll(category);
  }

  @Get('by-key/:key')
  findByKey(@Param('key') key: string) {
    return this.systemSettingService.findByKey(key);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemSettingService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSystemSettingDto,
  ) {
    return this.systemSettingService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemSettingService.remove(id);
  }
}
