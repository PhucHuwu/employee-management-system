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

  @Get('email')
  getEmailSettings() {
    return this.systemSettingService.getByCategory('email');
  }

  @Put('email')
  updateEmailSettings(@Body() body: Record<string, string>) {
    return this.systemSettingService.updateByCategory('email', body);
  }

  @Get('notifications')
  getNotificationSettings() {
    return this.systemSettingService.getByCategory('notification');
  }

  @Put('notifications')
  updateNotificationSettings(@Body() body: Record<string, string>) {
    return this.systemSettingService.updateByCategory('notification', body);
  }

  @Get('timesheet')
  getTimesheetSettings() {
    return this.systemSettingService.getByCategory('timesheet');
  }

  @Put('timesheet')
  updateTimesheetSettings(@Body() body: Record<string, string>) {
    return this.systemSettingService.updateByCategory('timesheet', body);
  }

  @Get('requests')
  getRequestSettings() {
    return this.systemSettingService.getByCategory('request');
  }

  @Put('requests')
  updateRequestSettings(@Body() body: Record<string, string>) {
    return this.systemSettingService.updateByCategory('request', body);
  }

  @Get('integrations')
  getIntegrationSettings() {
    return this.systemSettingService.getByCategory('integration');
  }

  @Put('integrations')
  updateIntegrationSettings(@Body() body: Record<string, string>) {
    return this.systemSettingService.updateByCategory('integration', body);
  }
}
