import { IsIn, IsNotEmpty } from 'class-validator';
import type { UserRole } from 'src/users/domain/entity/User.entity';

export default class UpdateUserRoleInputDto {
  @IsIn(['participant', 'organizer', 'admin'])
  @IsNotEmpty()
  role: UserRole;
}
