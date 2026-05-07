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
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @Permissions({ resource: 'invoice', action: 'read' })
  listInvoices(@Query() query: InvoiceQueryDto) {
    return this.invoiceService.listInvoices(query);
  }

  @Get('accounts-receivable')
  @Permissions({ resource: 'invoice', action: 'read' })
  async getAccountsReceivable(): Promise<ReturnType<InvoiceService['getAccountsReceivable']>> {
    return this.invoiceService.getAccountsReceivable();
  }

  @Get(':id')
  @Permissions({ resource: 'invoice', action: 'read' })
  getInvoiceById(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoiceService.getInvoiceById(id);
  }

  @Post()
  @Permissions({ resource: 'invoice', action: 'create' })
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'invoice', action: 'update' })
  updateInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.updateInvoice(id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'invoice', action: 'delete' })
  deleteInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoiceService.deleteInvoice(id);
  }

  @Post(':id/send')
  @Permissions({ resource: 'invoice', action: 'update' })
  sendInvoice(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.invoiceService.sendInvoice(user, id);
  }

  @Post(':id/pay')
  @Permissions({ resource: 'invoice', action: 'update' })
  payInvoice(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.invoiceService.payInvoice(user, id);
  }

  @Post('generate-from-revenue')
  @Permissions({ resource: 'invoice', action: 'create' })
  generateFromRevenue(
    @CurrentUser() user: AuthUser,
    @Body() dto: GenerateInvoiceDto,
  ) {
    return this.invoiceService.generateFromRevenue(user, dto);
  }
}
