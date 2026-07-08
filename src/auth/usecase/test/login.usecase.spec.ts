import * as bcrypt from 'bcrypt';
import LoginUseCase from '../login.usecase';

const makeHashedUser = async (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: 'João Silva',
  email: 'joao@test.com',
  password: await bcrypt.hash('senha123', 10),
  role: 'participant',
  cpfCnpj: '12345678901',
  ...overrides,
});

const makeJwtService = (token = 'mock-jwt-token') => ({
  signAsync: jest.fn().mockResolvedValue(token),
});

const makeUserRepo = (user: Record<string, unknown> | null) => ({
  findByEmail: jest.fn().mockResolvedValue(user),
});

const makeLoginAttemptsCounter = () => ({ inc: jest.fn() });

describe('LoginUseCase', () => {
  describe('successful login', () => {
    it('should return access token and user data on valid credentials', async () => {
      const user = await makeHashedUser();
      const loginUC = new LoginUseCase(makeUserRepo(user) as any, makeJwtService() as any, makeLoginAttemptsCounter() as any);
      const result = await loginUC.run({ email: 'joao@test.com', password: 'senha123' });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.userId).toBe(1);
      expect(result.email).toBe('joao@test.com');
      expect(result.name).toBe('João Silva');
      expect(result.role).toBe('participant');
    });

    it('should call signAsync with the correct JWT payload', async () => {
      const user = await makeHashedUser();
      const jwtService = makeJwtService();
      const loginUC = new LoginUseCase(makeUserRepo(user) as any, jwtService as any, makeLoginAttemptsCounter() as any);
      await loginUC.run({ email: 'joao@test.com', password: 'senha123' });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 1, email: 'joao@test.com', role: 'participant' },
        expect.objectContaining({ expiresIn: '30d' }),
      );
    });

    it('should use 30d expiry for participant accounts', async () => {
      const user = await makeHashedUser({ role: 'participant' });
      const jwtService = makeJwtService();
      const loginUC = new LoginUseCase(makeUserRepo(user) as any, jwtService as any, makeLoginAttemptsCounter() as any);
      await loginUC.run({ email: 'joao@test.com', password: 'senha123' });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ expiresIn: '30d' }),
      );
    });

    it('should use 1d expiry for organizer accounts', async () => {
      const user = await makeHashedUser({ role: 'organizer', email: 'org@test.com' });
      const jwtService = makeJwtService();
      const loginUC = new LoginUseCase(makeUserRepo(user) as any, jwtService as any, makeLoginAttemptsCounter() as any);
      await loginUC.run({ email: 'org@test.com', password: 'senha123' });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ expiresIn: '1d' }),
      );
    });
  });

  describe('authentication errors', () => {
    it('should throw "Invalid credentials" when user does not exist', async () => {
      const loginUC = new LoginUseCase(makeUserRepo(null) as any, makeJwtService() as any, makeLoginAttemptsCounter() as any);
      await expect(
        loginUC.run({ email: 'naoexiste@test.com', password: 'qualquer' }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw "Invalid credentials" when password is wrong', async () => {
      const user = await makeHashedUser();
      const loginUC = new LoginUseCase(makeUserRepo(user) as any, makeJwtService() as any, makeLoginAttemptsCounter() as any);
      await expect(
        loginUC.run({ email: 'joao@test.com', password: 'senhaerrada' }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should return the same error message whether email or password is wrong', async () => {
      const user = await makeHashedUser();
      const repoWithUser = makeUserRepo(user);
      const repoEmpty = makeUserRepo(null);

      const ucWithUser = new LoginUseCase(repoWithUser as any, makeJwtService() as any, makeLoginAttemptsCounter() as any);
      const ucEmpty = new LoginUseCase(repoEmpty as any, makeJwtService() as any, makeLoginAttemptsCounter() as any);

      const wrongPassErr = await ucWithUser.run({ email: 'joao@test.com', password: 'x' }).catch(e => e.message);
      const noEmailErr = await ucEmpty.run({ email: 'x@x.com', password: 'x' }).catch(e => e.message);

      expect(wrongPassErr).toBe(noEmailErr);
    });
  });
});
