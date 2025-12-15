import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export default class CreateTicketUseCaseInputDto extends PartialClass<CreateTicketUseCaseInputDto> {
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantityAvailable: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  minPerOrder?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxPerOrder?: number;

  @IsDateString()
  @IsOptional()
  saleStartDate?: string;

  @IsDateString()
  @IsOptional()
  saleEndDate?: string;

  @IsString()
  @IsOptional()
  ticketType?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
