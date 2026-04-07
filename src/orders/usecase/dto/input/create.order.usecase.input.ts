import CreateOrderUseCaseInputDto from 'src/orders/external/dto/create.order.usecase.input.dto';

export default class CreateOrderUseCaseInput extends CreateOrderUseCaseInputDto {
  constructor(dto: CreateOrderUseCaseInputDto) {
    super(dto);
    Object.assign(this, dto);
  }
}

