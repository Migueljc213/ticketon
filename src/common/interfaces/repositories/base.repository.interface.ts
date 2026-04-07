import { DeepPartial, FindOneOptions, ObjectLiteral } from 'typeorm';

export default interface IBaseRepository<
  T extends ObjectLiteral & { id: number },
> {
  create(input: DeepPartial<T>): Promise<T>;
  findOne(input: FindOneOptions<T>): Promise<T>;
  findAll(): Promise<T[]>;
  update(input: DeepPartial<T>): Promise<T>;
  delete(input: DeepPartial<T>): Promise<void>;
}
