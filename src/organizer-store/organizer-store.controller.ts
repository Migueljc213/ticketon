import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

interface AuthRequest extends Request {
  user: { id: number; email: string };
}

const CATEGORIES = [
  'other',
  'clothing',
  'accessories',
  'food',
  'drinks',
  'collectibles',
  'digital',
];
const ORDER_STATUSES = ['pending', 'confirmed', 'cancelled'];

class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do produto é obrigatório' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive({ message: 'O preço deve ser maior que zero' })
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsIn(CATEGORIES, { message: 'Categoria inválida' })
  category: string;

  @IsOptional()
  eventId?: number | null;
}

class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive({ message: 'O preço deve ser maior que zero' })
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsIn(CATEGORIES, { message: 'Categoria inválida' })
  @IsOptional()
  category?: string;

  @IsOptional()
  eventId?: number | null;
}

class BuyProductDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  customerName: string;

  @IsString()
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  customerEmail: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsInt()
  @Min(1, { message: 'A quantidade deve ser pelo menos 1' })
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES, { message: 'Status inválido' })
  status: string;
}

const PRODUCT_SELECT = `
  SELECT p.id, p.organizer_id AS organizerId, p.name, p.description,
         p.price, p.stock, p.image_url AS imageUrl, p.category,
         p.is_active AS isActive, p.created_at AS createdAt,
         p.event_id AS eventId, e.title AS eventName
  FROM store_products p
  LEFT JOIN events e ON e.id = p.event_id
`;

@Controller('organizer-store')
export default class OrganizerStoreController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  @Get('by-event/:eventId')
  @HttpCode(HttpStatus.OK)
  async getByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.ds.query(
      `SELECT p.id, p.name, p.description, p.price, p.stock,
              p.image_url AS imageUrl, p.category, p.organizer_id AS organizerId
       FROM store_products p
       WHERE p.event_id = ? AND p.is_active = 1
       ORDER BY p.created_at DESC`,
      [eventId],
    );
  }

  @Get(':organizerId/products')
  @HttpCode(HttpStatus.OK)
  async getActiveProducts(
    @Param('organizerId', ParseIntPipe) organizerId: number,
  ) {
    return this.mapProducts(
      await this.ds.query(
        `${PRODUCT_SELECT} WHERE p.organizer_id = ? AND p.is_active = 1 ORDER BY p.created_at DESC`,
        [organizerId],
      ),
    );
  }

  @Get(':organizerId/products/manage')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAllProducts(
    @Param('organizerId', ParseIntPipe) organizerId: number,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(req.user.id, organizerId);
    return this.mapProducts(
      await this.ds.query(
        `${PRODUCT_SELECT} WHERE p.organizer_id = ? ORDER BY p.created_at DESC`,
        [organizerId],
      ),
    );
  }

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
        dto.category,
      ],
    );
    return this.getProductOrThrow(result.insertId);
  }

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
    const params: unknown[] = [];
    const columnMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      price: 'price',
      stock: 'stock',
      imageUrl: 'image_url',
      category: 'category',
      eventId: 'event_id',
    };
    for (const [key, column] of Object.entries(columnMap)) {
      if (dto[key as keyof UpdateProductDto] !== undefined) {
        fields.push(`${column} = ?`);
        params.push(dto[key as keyof UpdateProductDto]);
      }
    }
    if (fields.length > 0) {
      params.push(productId);
      await this.ds.query(
        `UPDATE store_products SET ${fields.join(', ')} WHERE id = ?`,
        params,
      );
    }
    return this.getProductOrThrow(productId);
  }

  @Delete(':organizerId/products/:productId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deactivateProduct(
    @Param('organizerId', ParseIntPipe) organizerId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(req.user.id, organizerId);
    await this.assertProductBelongsToOrganizer(productId, organizerId);
    await this.ds.query(
      `UPDATE store_products SET is_active = 0 WHERE id = ?`,
      [productId],
    );
    return { ok: true };
  }

  @Post('products/:productId/buy')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async buyProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: BuyProductDto,
  ) {
    const [product] = await this.ds.query(
      `SELECT id, price, stock FROM store_products WHERE id = ? AND is_active = 1`,
      [productId],
    );
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (dto.quantity > product.stock) {
      throw new BadRequestException('Estoque insuficiente');
    }

    const unitPrice = Number(product.price);
    const totalAmount = unitPrice * dto.quantity;

    const result = await this.ds.query(
      `INSERT INTO store_orders
         (product_id, customer_name, customer_email, customer_phone, quantity, unit_price, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        dto.customerName,
        dto.customerEmail,
        dto.customerPhone ?? null,
        dto.quantity,
        unitPrice,
        totalAmount,
        dto.notes ?? null,
      ],
    );
    await this.ds.query(
      `UPDATE store_products SET stock = stock - ? WHERE id = ?`,
      [dto.quantity, productId],
    );

    return {
      id: result.insertId,
      productId,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone ?? null,
      quantity: dto.quantity,
      unitPrice,
      totalAmount,
      status: 'pending',
      notes: dto.notes ?? null,
    };
  }

  @Get(':organizerId/orders')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getOrders(
    @Param('organizerId', ParseIntPipe) organizerId: number,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(req.user.id, organizerId);
    return this.ds.query(
      `SELECT o.id, o.product_id AS productId, p.name AS productName,
              o.customer_name AS customerName, o.customer_email AS customerEmail,
              o.customer_phone AS customerPhone, o.quantity,
              o.unit_price AS unitPrice, o.total_amount AS totalAmount,
              o.status, o.notes, o.created_at AS createdAt
       FROM store_orders o
       INNER JOIN store_products p ON p.id = o.product_id
       WHERE p.organizer_id = ?
       ORDER BY o.created_at DESC`,
      [organizerId],
    );
  }

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
    const [order] = await this.ds.query(
      `SELECT o.id FROM store_orders o
       INNER JOIN store_products p ON p.id = o.product_id
       WHERE o.id = ? AND p.organizer_id = ?`,
      [orderId, organizerId],
    );
    if (!order) throw new NotFoundException('Pedido não encontrado');
    await this.ds.query(`UPDATE store_orders SET status = ? WHERE id = ?`, [
      dto.status,
      orderId,
    ]);
    return { ok: true };
  }

  private mapProducts(rows: Array<Record<string, unknown>>) {
    return rows.map((r) => ({ ...r, isActive: Boolean(r.isActive) }));
  }

  private async getProductOrThrow(productId: number) {
    const [product] = await this.ds.query(
      `${PRODUCT_SELECT} WHERE p.id = ?`,
      [productId],
    );
    if (!product) throw new NotFoundException('Produto não encontrado');
    return { ...product, isActive: Boolean(product.isActive) };
  }

  private async assertIsOrganizer(userId: number, organizerId: number) {
    const [org] = await this.ds.query(
      `SELECT id FROM organizers WHERE id = ? AND user_id = ?`,
      [organizerId, userId],
    );
    if (!org) {
      throw new UnauthorizedException('Você não tem permissão para esta ação');
    }
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
}
