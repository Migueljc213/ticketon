import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export default class CreateEventFeedbackDto {
  @IsInt({ message: 'ID do ingresso deve ser um número inteiro' })
  @IsOptional()
  purchasedTicketId?: number;

  @IsInt({ message: 'NPS deve ser um número inteiro' })
  @Min(0, { message: 'NPS mínimo é 0' })
  @Max(10, { message: 'NPS máximo é 10' })
  @IsNotEmpty({ message: 'NPS é obrigatório' })
  npsScore: number;

  @IsInt({ message: 'Nota do som deve ser um número inteiro' })
  @Min(1, { message: 'Nota mínima é 1' })
  @Max(5, { message: 'Nota máxima é 5' })
  @IsOptional()
  soundRating?: number;

  @IsInt({ message: 'Nota do banheiro deve ser um número inteiro' })
  @Min(1, { message: 'Nota mínima é 1' })
  @Max(5, { message: 'Nota máxima é 5' })
  @IsOptional()
  bathroomRating?: number;

  @IsInt({ message: 'Nota do bar deve ser um número inteiro' })
  @Min(1, { message: 'Nota mínima é 1' })
  @Max(5, { message: 'Nota máxima é 5' })
  @IsOptional()
  barWaitRating?: number;

  @IsInt({ message: 'Nota de segurança deve ser um número inteiro' })
  @Min(1, { message: 'Nota mínima é 1' })
  @Max(5, { message: 'Nota máxima é 5' })
  @IsOptional()
  securityRating?: number;

  @IsString({ message: 'Comentário deve ser texto' })
  @MaxLength(1000, { message: 'Comentário deve ter no máximo 1000 caracteres' })
  @IsOptional()
  openComment?: string;
}
