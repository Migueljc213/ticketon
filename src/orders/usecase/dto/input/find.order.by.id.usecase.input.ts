export default class FindOrderByIdUseCaseInput {
  id: number;

  constructor(partial: Partial<FindOrderByIdUseCaseInput>) {
    Object.assign(this, partial);
  }
}
