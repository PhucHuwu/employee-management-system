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
import { CreateCapabilityDto } from './dto/create-capability.dto';
import { UpdateCapabilityDto } from './dto/update-capability.dto';
import { CapabilityService } from './capability.service';

@Controller('capabilities')
export class CapabilityController {
  constructor(private readonly capabilityService: CapabilityService) {}

  @Get()
  @Permissions({ resource: 'capability', action: 'read' })
  listCapabilities() {
    return this.capabilityService.listCapabilities();
  }

  @Post()
  @Permissions({ resource: 'capability', action: 'create' })
  createCapability(@Body() dto: CreateCapabilityDto) {
    return this.capabilityService.createCapability(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'capability', action: 'update' })
  updateCapability(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCapabilityDto,
  ) {
    return this.capabilityService.updateCapability(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'capability', action: 'delete' })
  deleteCapability(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.capabilityService.deleteCapability(user, id);
  }
}
