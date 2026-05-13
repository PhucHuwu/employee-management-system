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
import { CreateSubPositionDto } from './dto/create-sub-position.dto';
import { UpdateSubPositionDto } from './dto/update-sub-position.dto';
import { SubPositionService } from './sub-position.service';

@Controller('sub-positions')
export class SubPositionController {
  constructor(private readonly subPositionService: SubPositionService) {}

  @Get()
  @Permissions({ resource: 'sub_position', action: 'read' })
  listSubPositions(@Query('positionId') positionId?: string) {
    return this.subPositionService.listSubPositions(positionId);
  }

  @Post()
  @Permissions({ resource: 'sub_position', action: 'create' })
  createSubPosition(@Body() dto: CreateSubPositionDto) {
    return this.subPositionService.createSubPosition(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'sub_position', action: 'update' })
  updateSubPosition(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubPositionDto,
  ) {
    return this.subPositionService.updateSubPosition(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'sub_position', action: 'delete' })
  deleteSubPosition(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.subPositionService.deleteSubPosition(user, id);
  }
}
