import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import EventConsumptionRecord, { ConsumptionCategory } from './domain/entity/EventConsumptionRecord.entity';

class CreateConsumptionRecordDto {
  @IsInt()
  @IsPositive()
  eventId: number;

  @IsString()
  @MaxLength(100)
  itemName: string;

  @IsOptional()
  @IsEnum(ConsumptionCategory)
  category?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  soldAt?: string;
}

@Controller('event-consumption-records')
@UseGuards(JwtAuthGuard)
export default class EventConsumptionRecordController {
  constructor(
    @InjectRepository(EventConsumptionRecord)
    private readonly repo: Repository<EventConsumptionRecord>,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateConsumptionRecordDto): Promise<EventConsumptionRecord> {
    const record = this.repo.create({
      eventId: dto.eventId,
      itemName: dto.itemName,
      category: dto.category ?? ConsumptionCategory.OUTRO,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      totalAmount: dto.unitPrice * dto.quantity,
      soldAt: dto.soldAt ? new Date(dto.soldAt) : null,
    });
    return this.repo.save(record);
  }

  @Get('event/:eventId')
  @HttpCode(HttpStatus.OK)
  async findByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<EventConsumptionRecord[]> {
    return this.repo.find({ where: { eventId }, order: { soldAt: 'DESC' } });
  }
}
