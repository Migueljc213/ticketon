import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  ticketId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}

export default class CreateOrderUseCaseInputDto extends PartialClass<CreateOrderUseCaseInputDto> {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNotEmpty()
  items: OrderItemDto[];
}

