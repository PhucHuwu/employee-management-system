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
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeService } from './employee.service';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Permissions({ resource: 'employee', action: 'create' })
  createEmployee(@CurrentUser() user: AuthUser, @Body() dto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(user, dto);
  }

  @Get(':id')
  @Permissions({ resource: 'employee', action: 'read' })
  getEmployee(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.getEmployeeById(user, id);
  }

  @Get()
  @Permissions({ resource: 'employee', action: 'read' })
  listEmployees(@CurrentUser() user: AuthUser, @Query() query: EmployeeQueryDto) {
    return this.employeeService.listEmployees(user, query);
  }

  @Put(':id')
  @Permissions({ resource: 'employee', action: 'update' })
  updateEmployee(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateEmployee(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'employee', action: 'delete' })
  deleteEmployee(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.softDeleteEmployee(user, id);
  }
}
