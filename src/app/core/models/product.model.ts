export interface Money {
  amount: number;
  currency: string;
}

export interface Stock {
  quantity: number;
  minimum: number;
  available: boolean;
  belowMinimum: boolean;
  outOfStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  reference: string;
  description: string;
  price: Money;
  stock: Stock;
}

export interface CreateProductDto {
  name: string;
  reference: string;
  description: string;
  price: number;
  stockQuantity: number;
  stockMinimum: number;
  currency: string;
}

export interface UpdateStockDto {
  quantity: number;
}
