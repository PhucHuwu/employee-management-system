import { Type } from 'class-transformer';
import {
  IsDate,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isGreaterThan', async: false })
class IsGreaterThanConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints as [string];
    const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
    if (typeof value !== 'number' || typeof relatedValue !== 'number') {
      return true;
    }
    return value > relatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints as [string];
    return `${args.property} must be greater than ${relatedPropertyName}`;
  }
}

export class CreateSalaryStructureDto {
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '0,2' })
  baseSalary!: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  allowance?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  bonus?: string;

  @Type(() => Date)
  @IsDate()
  effectiveFrom!: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @Validate(IsGreaterThanConstraint, ['effectiveFrom'])
  effectiveTo?: Date;

  @IsUUID()
  employeeId!: string;
}
