import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsInt()
  @IsPositive()
  ticketId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export default class CreateOrderInputDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  backUrl?: string;

  @IsOptional()
  @IsString()
  customerGender?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  customerAge?: number;

  @IsOptional()
  @IsString()
  customerNeighborhood?: string;
}
