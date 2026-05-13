import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { LinkCustomerDto } from './dto/link-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerService } from './services/customer.service';

@Controller()
export class CustomersController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('customers')
  @Permissions({ resource: 'customer', action: 'read' })
  listCustomers(@Query() query: CustomerQueryDto) {
    return this.customerService.listCustomers(query);
  }

  @Post('customers')
  @Permissions({ resource: 'customer', action: 'create' })
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.customerService.createCustomer(dto);
  }

  @Get('customers/:id')
  @Permissions({ resource: 'customer', action: 'read' })
  getCustomerById(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.getCustomerById(id);
  }

  @Put('customers/:id')
  @Permissions({ resource: 'customer', action: 'update' })
  updateCustomer(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.updateCustomer(id, dto);
  }

  @Delete('customers/:id')
  @Permissions({ resource: 'customer', action: 'delete' })
  deleteCustomer(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.deleteCustomer(id);
  }

  @Post('projects/:id/customers')
  @Permissions({ resource: 'project', action: 'update' })
  linkCustomer(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Body() dto: LinkCustomerDto,
  ) {
    return this.customerService.linkCustomerToProject(projectId, dto);
  }

  @Delete('projects/:id/customers/:customerId')
  @Permissions({ resource: 'project', action: 'update' })
  unlinkCustomer(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.customerService.unlinkCustomerFromProject(projectId, customerId);
  }
}
