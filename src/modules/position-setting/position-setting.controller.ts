import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreatePositionSettingDto } from './dto/create-position-setting.dto';
import { UpdatePositionSettingDto } from './dto/update-position-setting.dto';
import { PositionSettingService } from './position-setting.service';

@Controller('position-settings')
export class PositionSettingController {
  constructor(
    private readonly positionSettingService: PositionSettingService,
  ) {}

  @Get()
  @Permissions({ resource: 'position_setting', action: 'read' })
  listPositionSettings(@Query('subPositionId') subPositionId?: string) {
    return this.positionSettingService.listPositionSettings(subPositionId);
  }

  @Post()
  @Permissions({ resource: 'position_setting', action: 'create' })
  createPositionSetting(@Body() dto: CreatePositionSettingDto) {
    return this.positionSettingService.createPositionSetting(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'position_setting', action: 'update' })
  updatePositionSetting(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePositionSettingDto,
  ) {
    return this.positionSettingService.updatePositionSetting(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'position_setting', action: 'delete' })
  deletePositionSetting(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.positionSettingService.deletePositionSetting(user, id);
  }
}
