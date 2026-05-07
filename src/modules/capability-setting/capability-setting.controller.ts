import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateCapabilitySettingDto } from './dto/create-capability-setting.dto';
import { UpdateCapabilitySettingDto } from './dto/update-capability-setting.dto';
import { CapabilitySettingService } from './capability-setting.service';

class CloneCapabilitySettingDto {
  userType!: string;
  positionId!: string;
}

@Controller('capability-settings')
export class CapabilitySettingController {
  constructor(
    private readonly capabilitySettingService: CapabilitySettingService,
  ) {}

  @Get()
  @Permissions({ resource: 'capability_setting', action: 'read' })
  listCapabilitySettings() {
    return this.capabilitySettingService.listCapabilitySettings();
  }

  @Post()
  @Permissions({ resource: 'capability_setting', action: 'create' })
  createCapabilitySetting(@Body() dto: CreateCapabilitySettingDto) {
    return this.capabilitySettingService.createCapabilitySetting(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'capability_setting', action: 'update' })
  updateCapabilitySetting(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCapabilitySettingDto,
  ) {
    return this.capabilitySettingService.updateCapabilitySetting(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'capability_setting', action: 'delete' })
  deleteCapabilitySetting(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.capabilitySettingService.deleteCapabilitySetting(user, id);
  }

  @Post(':id/clone')
  @Permissions({ resource: 'capability_setting', action: 'create' })
  cloneCapabilitySetting(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloneCapabilitySettingDto,
  ) {
    return this.capabilitySettingService.cloneCapabilitySetting(
      id,
      dto.userType,
      dto.positionId,
    );
  }
}
