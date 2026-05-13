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
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { OnsiteRequestService } from './onsite-request.service';
import { CreateOnsiteRequestDto } from './dto/create-onsite-request.dto';
import { UpdateOnsiteRequestDto } from './dto/update-onsite-request.dto';

@Controller('onsite-requests')
export class OnsiteRequestController {
  constructor(private readonly onsiteRequestService: OnsiteRequestService) {}

  @Post()
  @Permissions({ resource: 'onsite-request', action: 'create' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateOnsiteRequestDto,
  ) {
    return this.onsiteRequestService.create(user, dto);
  }

  @Get()
  @Permissions({ resource: 'onsite-request', action: 'read' })
  findAll() {
    return this.onsiteRequestService.findAll();
  }

  @Get(':id')
  @Permissions({ resource: 'onsite-request', action: 'read' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.onsiteRequestService.findOne(id);
  }

  @Put(':id')
  @Permissions({ resource: 'onsite-request', action: 'update' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnsiteRequestDto,
  ) {
    return this.onsiteRequestService.update(user, id, dto);
  }

  @Post(':id/approve')
  @Permissions({ resource: 'onsite-request', action: 'approve' })
  approve(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.onsiteRequestService.approve(user, id);
  }

  @Post(':id/reject')
  @Permissions({ resource: 'onsite-request', action: 'reject' })
  reject(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.onsiteRequestService.reject(user, id);
  }

  @Post(':id/cancel')
  @Permissions({ resource: 'onsite-request', action: 'cancel' })
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.onsiteRequestService.cancel(user, id);
  }

  @Delete(':id')
  @Permissions({ resource: 'onsite-request', action: 'delete' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.onsiteRequestService.remove(user, id);
  }
}
