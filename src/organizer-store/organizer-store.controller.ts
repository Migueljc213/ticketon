import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: number; email: string };
}

class CreateProductDto {
  @IsString() @IsNotEmpty() @MaxLength(255)
  name: string;

  @IsOptional() @IsString() @MaxLength(2000)
  description?: string;

  @IsNumber() @IsPositive()
  @Type(() => Number)
  price: number;

  @IsInt() @Min(0)
  @Type(() => Number)
  stock: number;

  @IsOptional() @IsString()
  imageUrl?: string;

  @IsOptional() @IsString() @MaxLength(50)
  category?: string;

  @IsOptional() @IsInt()
  @Type(() => Number)
  eventId?: number;
}

class UpdateProductDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255)
  name?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  description?: string;

  @IsOptional() @IsNumber() @IsPositive()
  @Type(() => Number)
  price?: number;

  @IsOptional() @IsInt() @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsOptional() @IsString()
  imageUrl?: string;

  @IsOptional() @IsString() @MaxLength(50)
  category?: string;

  @IsOptional() @IsInt()
  @Type(() => Number)
  eventId?: number | null;

  @IsOptional()
  isActive?: boolean;
}

class BuyProductDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsOptional() @IsString() @MaxLength(20)
  customerPhone?: string;

  @IsInt() @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsOptional() @IsString() @MaxLength(500)
  notes?: string;
}

class UpdateOrderStatusDto {
  @IsString() @IsNotEmpty()
  status: 'pending' | 'confirmed' | 'cancelled';
}

@Controller('organizer-store')
export default class OrganizerStoreController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  // ── GET produtos públicos de um organizador ───────────────────────────────────
  @Get(':organizerId/products')
  @HttpCode(HttpStatus.OK)
  async getProducts(
    @Param('organizerId', ParseIntPipe) organizerId: number,
  ) {
    return this.ds.query<Array<Record<string, unknown>>>(
      `SELECT p.id, p.organizer_id AS organizerId, p.event_id AS eventId,
              e.title AS eventName,
              p.name, p.description, p.price,
              p.stock, p.image_url AS imageUrl, p.category, p.is_active AS isActive,
              p.created_at AS createdAt, p.updated_at AS updatedAt
       FROM store_products p
       LEFT JOIN events e ON e.id = p.event_id
       WHERE p.organizer_id = ? AND p.is_active = 1
       ORDER BY p.created_at DESC`,
      [organizerId],
    );
  }

  // ── GET produtos públicos de um evento ────────────────────────────────────────
  @Get('by-event/:eventId')
  @HttpCode(HttpStatus.OK)
  async getProductsByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.ds.query<Array<Record<string, unknown>>>(
      `SELECT p.id, p.organizer_id AS organizerId, p.event_id AS eventId,
              e.title AS eventName,
              p.name, p.description, p.price,
              p.stock, p.image_url AS imageUrl, p.category, p.is_active AS isActive,
              p.created_at AS createdAt
       FROM store_products p
       LEFT JOIN events e ON e.id = p.event_id
       WHERE p.event_id = ? AND p.is_active = 1 AND p.stock > 0
       ORDER BY p.created_at DESC`,
      [eventId],
    );
  }

  // ── GET todos os produtos (owner) ─────────────────────────────────────────────
  @Get(':organizerId/products/manage')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProductsManage(
    @Param('organizerId', ParseIntPipe) organizerId: number,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(req.user.id, organizerId);
    return this.ds.query<Array<Record<string, unknown>>>(
      `SELECT p.id, p.organizer_id AS organizerId, p.event_id AS eventId,
              e.title AS eventName,
              p.name, p.description, p.price,
              p.stock, p.image_url AS imageUrl, p.category, p.is_active AS isActive,
              p.created_at AS createdAt, p.updated_at AS updatedAt
       FROM store_products p
       LEFT JOIN events e ON e.id = p.event_id
       WHERE p.organizer_id = ?
       ORDER BY p.created_at DESC`,
      [organizerId],
    );
  }

  // ── POST criar produto ────────────────────────────────────────────────────────
  @Post(':organizerId/products')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Param('organizerId', ParseIntPipe) organizerId: number,
    @Body() dto: CreateProductDto,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(req.user.id, organizerId);
    const result = await this.ds.query(
      `INSERT INTO store_products
         (organizer_id, event_id, name, description, price, stock, image_url, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organizerId,
        dto.eventId ?? null,
        dto.name,
        dto.description ?? null,
        dto.price,
        dto.stock,
        dto.imageUrl ?? null,
        dto.category ?? 'other',
      ],
    );
    return this.findProductById(result.insertId);
  }

  // ── PATCH atualizar produto ───────────────────────────────────────────────────
  @Patch(':organizerId/products/:productId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProduct(
    @Param('organizerId', ParseIntPipe) organizerId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(req.user.id, organizerId);
    await this.assertProductBelongsToOrganizer(productId, organizerId);

    const fields: string[] = [];
    const values: unknown[] = [];

    if (dto.name !== undefined)        { fields.push('name = ?');        values.push(dto.name); }
    if (dto.description !== undefined) { fields.push('description = ?'); values.push(dto.description); }
    if (dto.price !== undefined)       { fields.push('price = ?');       values.push(dto.price); }
    if (dto.stock !== undefined)       { fields.push('stock = ?');       values.push(dto.stock); }
    if (dto.imageUrl !== undefined)    { fields.push('image_url = ?');   values.push(dto.imageUrl); }
    if (dto.category !== undefined)    { fields.push('category = ?');    values.push(dto.category); }
    if (dto.eventId !== undefined)     { fields.push('event_id = ?');    values.push(dto.eventId ?? null); }
    if (dto.isActive !== undefined)    { fields.push('is_active = ?');   values.push(dto.isActive ? 1 : 0); }

    if (fields.length === 0) return this.findProductById(productId);

    values.push(productId);
    await this.ds.query(
      `UPDATE store_products SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
    return this.findProductById(productId);
  }

  // ── DELETE remover produto ────────────────────────────────────────────────────
  @Delete(':organizerId/products/:productId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteProduct(
    @Param('organizerId', ParseIntPipe) organizerId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(req.user.id, organizerId);
    await this.assertProductBelongsToOrganizer(productId, organizerId);
    // Soft-delete para não perder histórico de pedidos
    await this.ds.query(
      `UPDATE store_products SET is_active = 0 WHERE id = ?`,
      [productId],
    );
    return { success: true };
  }

  // ── POST comprar produto ──────────────────────────────────────────────────────
  @Post('products/:productId/buy')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async buyProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: BuyProductDto,
    @Req() req: AuthRequest,
  ) {
    const [product] = await this.ds.query<Array<Record<string, unknown>>>(
      `SELECT id, organizer_id, price, stock, is_active, name
       FROM store_products WHERE id = ? FOR UPDATE`,
      [productId],
    );

    if (!product) throw new NotFoundException('Produto não encontrado');
    if (!product.is_active) throw new BadRequestException('Produto indisponível');
    if ((product.stock as number) < dto.quantity) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${product.stock}`,
      );
    }

    const unitPrice = Number(product.price);
    const totalAmount = unitPrice * dto.quantity;

    await this.ds.query(
      `UPDATE store_products SET stock = stock - ? WHERE id = ?`,
      [dto.quantity, productId],
    );

    const result = await this.ds.query(
      `INSERT INTO store_orders
         (product_id, organizer_id, user_id, customer_name, customer_email,
          customer_phone, quantity, unit_price, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        product.organizer_id,
        req.user.id,
        dto.customerName,
        dto.customerEmail,
        dto.customerPhone ?? null,
        dto.quantity,
        unitPrice,
        totalAmount,
        dto.notes ?? null,
      ],
    );

    return {
      orderId: result.insertId,
      productName: product.name,
      quantity: dto.quantity,
      unitPrice,
      totalAmount,
      status: 'pending',
    };
  }

  // ── GET pedidos do organizador ────────────────────────────────────────────────
  @Get(':organizerId/orders')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getOrders(
    @Param('organizerId', ParseIntPipe) organizerId: number,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(req.user.id, organizerId);
    return this.ds.query<Array<Record<string, unknown>>>(
      `SELECT o.id, o.product_id AS productId, p.name AS productName,
              o.customer_name AS customerName, o.customer_email AS customerEmail,
              o.customer_phone AS customerPhone, o.quantity, o.unit_price AS unitPrice,
              o.total_amount AS totalAmount, o.status, o.notes,
              o.created_at AS createdAt
       FROM store_orders o
       JOIN store_products p ON p.id = o.product_id
       WHERE o.organizer_id = ?
       ORDER BY o.created_at DESC
       LIMIT 200`,
      [organizerId],
    );
  }

  // ── PATCH atualizar status do pedido ──────────────────────────────────────────
  @Patch(':organizerId/orders/:orderId/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('organizerId', ParseIntPipe) organizerId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(req.user.id, organizerId);
    const allowed = ['pending', 'confirmed', 'cancelled'];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException('Status inválido');
    }

    // Se cancelando, devolve estoque
    if (dto.status === 'cancelled') {
      const [order] = await this.ds.query<Array<Record<string, unknown>>>(
        `SELECT product_id, quantity, status FROM store_orders WHERE id = ? AND organizer_id = ?`,
        [orderId, organizerId],
      );
      if (!order) throw new NotFoundException('Pedido não encontrado');
      if (order.status !== 'cancelled') {
        await this.ds.query(
          `UPDATE store_products SET stock = stock + ? WHERE id = ?`,
          [order.quantity, order.product_id],
        );
      }
    }

    await this.ds.query(
      `UPDATE store_orders SET status = ? WHERE id = ? AND organizer_id = ?`,
      [dto.status, orderId, organizerId],
    );
    return { orderId, status: dto.status };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  private async assertIsOrganizer(userId: number, organizerId: number) {
    const [org] = await this.ds.query(
      `SELECT id FROM organizers WHERE id = ? AND user_id = ?`,
      [organizerId, userId],
    );
    if (!org) throw new UnauthorizedException('Você não tem permissão para esta ação');
  }

  private async assertProductBelongsToOrganizer(
    productId: number,
    organizerId: number,
  ) {
    const [product] = await this.ds.query(
      `SELECT id FROM store_products WHERE id = ? AND organizer_id = ?`,
      [productId, organizerId],
    );
    if (!product) throw new NotFoundException('Produto não encontrado');
  }

  private async findProductById(id: number) {
    const [product] = await this.ds.query<Array<Record<string, unknown>>>(
      `SELECT p.id, p.organizer_id AS organizerId, p.event_id AS eventId,
              e.title AS eventName,
              p.name, p.description, p.price,
              p.stock, p.image_url AS imageUrl, p.category, p.is_active AS isActive,
              p.created_at AS createdAt, p.updated_at AS updatedAt
       FROM store_products p
       LEFT JOIN events e ON e.id = p.event_id
       WHERE p.id = ?`,
      [id],
    );
    return product;
  }
}
