import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';
import { IsAfterDate } from 'src/common/validators/is-after-date.validator';

export default class CreateEventUseCaseInputDto extends PartialClass<CreateEventUseCaseInputDto> {
  @IsNumber()
  @IsNotEmpty()
  organizerId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsDateString()
  @IsNotEmpty()
  eventDate: Date;

  @IsDateString()
  @IsOptional()
  @IsAfterDate('eventDate', {
    message: 'Data de término deve ser posterior à data de início',
  })
  eventEndDate?: Date;

  @IsString()
  @IsNotEmpty()
  locationType: string;

  @IsString()
  @IsOptional()
  venueName?: string | null;

  @IsString()
  @IsOptional()
  address?: string | null;

  @IsString()
  @IsOptional()
  complement?: string | null;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  @ValidateIf(
    (o: { state?: string }) => o.state !== undefined && o.state !== '',
  )
  @Length(2, 2)
  state?: string;

  @IsString()
  @IsOptional()
  @ValidateIf(
    (o: { zipcode?: string }) => o.zipcode !== undefined && o.zipcode !== '',
  )
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
