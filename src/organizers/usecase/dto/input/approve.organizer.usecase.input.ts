export default class ApproveOrganizerUseCaseInput {
  organizerId: number;
  isVerified: boolean;

  constructor(organizerId: number, isVerified: boolean) {
    this.organizerId = organizerId;
    this.isVerified = isVerified;
  }
}

