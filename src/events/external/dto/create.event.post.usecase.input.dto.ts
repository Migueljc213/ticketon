import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export default class CreateEventPostUseCaseInputDto extends PartialClass<CreateEventPostUseCaseInputDto> {
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsOptional()
  orderId?: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
