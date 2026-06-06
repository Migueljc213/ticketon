import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export default class UpdateOrganizerUseCaseInputDto extends PartialClass<UpdateOrganizerUseCaseInputDto> {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

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
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
