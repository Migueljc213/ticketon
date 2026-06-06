export default class LoginUseCaseOutput {
  accessToken: string;
  userId: number;
  email: string;

  constructor(accessToken: string, userId: number, email: string) {
    this.accessToken = accessToken;
    this.userId = userId;
    this.email = email;
  }
}
