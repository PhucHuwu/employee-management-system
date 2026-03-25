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
import { Role } from '@prisma/client';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { Roles } from '@/modules/identity/decorators/roles.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeService } from './employee.service';

@Controller('employees')
@Roles(Role.ADMIN, Role.MANAGER)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  createEmployee(@CurrentUser() user: AuthUser, @Body() dto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(user, dto);
  }

  @Get(':id')
  getEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.getEmployeeById(id);
  }

  @Get()
  listEmployees(@Query() query: EmployeeQueryDto) {
    return this.employeeService.listEmployees(query);
  }

  @Put(':id')
  updateEmployee(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateEmployee(user, id, dto);
  }

  @Delete(':id')
  deleteEmployee(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.softDeleteEmployee(user, id);
  }
}
