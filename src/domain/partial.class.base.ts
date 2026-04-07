export default abstract class PartialClass<T> {
  constructor(data: Partial<T>) {
    Object.assign(this, data);
  }
}
