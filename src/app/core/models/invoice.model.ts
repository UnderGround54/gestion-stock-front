import { Money } from './product.model';

export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Invoice {
  id: string;
  orderId: string;
  status: InvoiceStatus;
  vatRate: number;
  amountExcludingTax: Money;
  vatAmount: Money;
  totalAmount: Money;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
}

export interface GenerateInvoiceDto {
  vatRate: number;
}
