import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export default class CreateEventUseCaseInputDto extends PartialClass<CreateEventUseCaseInputDto> {
  @IsNumber()
  @IsNotEmpty()
  organizerId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsDateString()
  @IsNotEmpty()
  eventDate: Date;

  @IsDateString()
  @IsOptional()
  eventEndDate?: Date;

  @IsString()
  @IsNotEmpty()
  locationType: string;

  @IsString()
  @IsOptional()
  venueName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  @Length(2, 2)
  state?: string;

  @IsString()
  @IsOptional()
  @Length(8, 8)
  zipcode?: string;

  @IsString()
  @IsOptional()
  onlineUrl?: string;

  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @IsNumber()
  @IsOptional()
  maxAttendees?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
