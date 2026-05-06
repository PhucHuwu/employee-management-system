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
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentService } from './department.service';

@Controller('departments')
@Roles(Role.ADMIN, Role.MANAGER)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  listDepartments() {
    return this.departmentService.listDepartments();
  }

  @Post()
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.createDepartment(dto);
  }

  @Put(':id')
  updateDepartment(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentService.updateDepartment(user, id, dto);
  }

  @Delete(':id')
  deleteDepartment(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.departmentService.deleteDepartment(user, id);
  }
}
