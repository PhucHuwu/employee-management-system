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
import { CreateScoreSettingDto } from './dto/create-score-setting.dto';
import { UpdateScoreSettingDto } from './dto/update-score-setting.dto';
import { ScoreSettingService } from './score-setting.service';

@Controller('score-settings')
export class ScoreSettingController {
  constructor(private readonly scoreSettingService: ScoreSettingService) {}

  @Get()
  @Permissions({ resource: 'score_setting', action: 'read' })
  listScoreSettings() {
    return this.scoreSettingService.listScoreSettings();
  }

  @Post()
  @Permissions({ resource: 'score_setting', action: 'create' })
  createScoreSetting(@Body() dto: CreateScoreSettingDto) {
    return this.scoreSettingService.createScoreSetting(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'score_setting', action: 'update' })
  updateScoreSetting(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScoreSettingDto,
  ) {
    return this.scoreSettingService.updateScoreSetting(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'score_setting', action: 'delete' })
  deleteScoreSetting(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.scoreSettingService.deleteScoreSetting(user, id);
  }
}
