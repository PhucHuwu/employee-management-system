import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '@/modules/identity/decorators/roles.decorator';
import { Scope } from '@/modules/identity/decorators/scope.decorator';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { LinkCustomerDto } from './dto/link-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerService } from './services/customer.service';

@Controller()
@Roles(Role.ADMIN, Role.MANAGER)
export class CustomersController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('customers')
  listCustomers(@Query() query: CustomerQueryDto) {
    return this.customerService.listCustomers(query);
  }

  @Post('customers')
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.customerService.createCustomer(dto);
  }

  @Get('customers/:id')
  getCustomerById(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.getCustomerById(id);
  }

  @Put('customers/:id')
  updateCustomer(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.updateCustomer(id, dto);
  }

  @Delete('customers/:id')
  deleteCustomer(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.deleteCustomer(id);
  }

  @Post('projects/:id/customers')
  @Scope('project')
  linkCustomer(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Body() dto: LinkCustomerDto,
  ) {
    return this.customerService.linkCustomerToProject(projectId, dto);
  }

  @Delete('projects/:id/customers/:customerId')
  @Scope('project')
  unlinkCustomer(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.customerService.unlinkCustomerFromProject(projectId, customerId);
  }
}
