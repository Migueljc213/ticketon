import ApproveOrganizerUseCase from '../approve.organizer.usecase';
import FakeOrganizerRepository from 'src/organizers/external/repository/fakes/fake.organizer.repository';
import Organizer from 'src/organizers/domain/entity/Organizer.entity';

describe('ApproveOrganizerUseCase', () => {
  let approveOrganizerUseCase: ApproveOrganizerUseCase;
  let fakeOrganizerRepository: FakeOrganizerRepository;

  beforeEach(() => {
    fakeOrganizerRepository = new FakeOrganizerRepository();
    approveOrganizerUseCase = new ApproveOrganizerUseCase(
      fakeOrganizerRepository,
    );
  });

  it('should approve an organizer', async () => {
    const organizer = new Organizer();
    organizer.id = 1;
    organizer.userId = 1;
    organizer.companyName = 'Test Company';
    organizer.cnpj = '12345678000190';
    organizer.phone = '11999999999';
    organizer.isVerified = false;
    await fakeOrganizerRepository.create(organizer);

    const result = await approveOrganizerUseCase.run({
      organizerId: 1,
      isVerified: true,
    } as any);

    expect(result.isVerified).toBe(true);
    expect(result.id).toBe(1);
  });

  it('should reject an organizer', async () => {
    const organizer = new Organizer();
    organizer.id = 1;
    organizer.userId = 1;
    organizer.companyName = 'Test Company';
    organizer.cnpj = '12345678000190';
    organizer.phone = '11999999999';
    organizer.isVerified = true;
    await fakeOrganizerRepository.create(organizer);

    const result = await approveOrganizerUseCase.run({
      organizerId: 1,
      isVerified: false,
    } as any);

    expect(result.isVerified).toBe(false);
  });

  it('should throw error when organizer does not exist', async () => {
    await expect(
      approveOrganizerUseCase.run({
        organizerId: 999,
        isVerified: true,
      } as any),
    ).rejects.toThrow('Organizer not found');
  });
});
