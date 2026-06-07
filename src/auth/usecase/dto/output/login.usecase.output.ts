export default class LoginUseCaseOutput {
  accessToken: string;
  userId: number;
  email: string;
  name: string;
  role: string;

  constructor(
    accessToken: string,
    userId: number,
    email: string,
    name: string,
    role: string,
  ) {
    this.accessToken = accessToken;
    this.userId = userId;
    this.email = email;
    this.name = name;
    this.role = role;
  }
}
