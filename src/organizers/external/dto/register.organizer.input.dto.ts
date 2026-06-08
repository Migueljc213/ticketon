import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export default class RegisterOrganizerInputDto extends PartialClass<RegisterOrganizerInputDto> {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @Length(14, 14)
  cnpj: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  state: string;

  @IsString()
  @IsOptional()
  description?: string;
}
