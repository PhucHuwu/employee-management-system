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
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentService } from './department.service';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @Permissions({ resource: 'department', action: 'read' })
  listDepartments() {
    return this.departmentService.listDepartments();
  }

  @Post()
  @Permissions({ resource: 'department', action: 'create' })
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.createDepartment(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'department', action: 'update' })
  updateDepartment(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentService.updateDepartment(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'department', action: 'delete' })
  deleteDepartment(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.departmentService.deleteDepartment(user, id);
  }
}
