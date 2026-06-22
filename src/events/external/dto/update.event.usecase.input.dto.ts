import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export default class UpdateEventUseCaseInputDto extends PartialClass<UpdateEventUseCaseInputDto> {
  @IsNumber()
  @IsOptional()
  organizerId?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsDateString()
  @IsOptional()
  eventDate?: Date;

  @IsDateString()
  @IsOptional()
  eventEndDate?: Date;

  @IsString()
  @IsOptional()
  locationType?: string;

  @IsString()
  @IsOptional()
  venueName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  complement?: string | null;

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

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['draft', 'published', 'cancelled'])
  status?: string;
}
