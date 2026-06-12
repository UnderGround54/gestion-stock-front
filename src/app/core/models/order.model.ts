import { Money } from './product.model';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED';

export interface OrderLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  status: OrderStatus;
  note: string;
  lines: OrderLine[];
  totalAmount: Money;
  createdAt: string;
}

export interface CreateOrderLineDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  clientId: string;
  note: string;
  lines: CreateOrderLineDto[];
}
