export default class FindOrdersByUserUseCaseInput {
  userId: number;

  constructor(partial: Partial<FindOrdersByUserUseCaseInput>) {
    Object.assign(this, partial);
  }
}
