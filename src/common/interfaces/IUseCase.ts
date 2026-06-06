export default interface IUsecase<I, O> {
  run(input: I): Promise<O>;
}
