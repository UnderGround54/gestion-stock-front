import { Money } from './product.model';

export interface OrderStatus {
  code: string;
  label: string;
}

export interface OrderLine {
  id: string;
  productId: string;
  productName: string;
  reference: string;
  quantity: number;
  unitPrice: Money;
  subTotal: Money;
}

export interface Order {
  id: string;
  number: string;
  clientId: string;
  status: OrderStatus;
  orderLines: OrderLine[];
  totalAmount: Money;
  customerNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderLineDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  clientId: string;
  customerNote: string;
  orderLines: CreateOrderLineDto[];
}
