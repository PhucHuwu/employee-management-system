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
import { Role } from '@prisma/client';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { Roles } from '@/modules/identity/decorators/roles.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { BulkUpdateEmployeePositionDto } from './dto/bulk-update-employee-position.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdateEmployeePositionDto } from './dto/update-employee-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionService } from './position.service';

@Controller('positions')
@Roles(Role.ADMIN, Role.MANAGER)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  listPositions() {
    return this.positionService.listPositions();
  }

  @Post()
  createPosition(@Body() dto: CreatePositionDto) {
    return this.positionService.createPosition(dto);
  }

  @Put(':id')
  updatePosition(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.positionService.updatePosition(user, id, dto);
  }

  @Delete(':id')
  deletePosition(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.positionService.deletePosition(user, id);
  }

  @Put('employees/:employeeId')
  updateEmployeePosition(
    @CurrentUser() user: AuthUser,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() dto: UpdateEmployeePositionDto,
  ) {
    return this.positionService.updateEmployeePosition(user, employeeId, dto);
  }

  @Put('employees/bulk')
  bulkUpdateEmployeePosition(
    @CurrentUser() user: AuthUser,
    @Body() dto: BulkUpdateEmployeePositionDto,
  ) {
    return this.positionService.bulkUpdateEmployeePosition(user, dto);
  }
}
