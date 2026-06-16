export interface Money {
  amount: number;
  currency: string;
}

export interface Stock {
  quantity: number;
  minimum: number;
  available: boolean;
  below_minimum: boolean;
  out_of_stock: boolean;
}

export interface Product {
  id: string;
  name: string;
  reference: string;
  description: string;
  price: Money;
  stock: Stock;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  reference: string;
  description: string;
  price: number;
  stockQuantity: number;
  minimumStock: number;
  currency: string;
}
export type StockOperation = 'increase' | 'decrease';
export interface UpdateStockDto {
  quantity: number;
  operation: StockOperation;
}
