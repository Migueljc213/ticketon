import UpdateUserUseCaseInputDto from 'src/users/external/dto/update.user.usecase.input.dto';
import { UserRole } from 'src/users/domain/entity/User.entity';

export default class UpdateUserUseCaseInput extends UpdateUserUseCaseInputDto {
  id: number;
  role?: UserRole;

  constructor(id: number, data: UpdateUserUseCaseInputDto & { role?: UserRole }) {
    super(data);
    Object.assign(this, data);
    this.id = id;
    this.role = data.role;
  }
}
