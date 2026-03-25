import { IsUUID } from 'class-validator';

export class LinkCustomerDto {
  @IsUUID()
  customerId!: string;
}
