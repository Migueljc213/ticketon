import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export default class CreateEventPostDto {
  @IsString({ message: 'O conteúdo deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O conteúdo não pode estar vazio.' })
  @MaxLength(1000, { message: 'O comentário não pode ter mais de 1000 caracteres.' })
  content: string;
}
